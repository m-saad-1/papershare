import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiClient from '@/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Filter,
  Download,
  ThumbsUp,
  FileText,
  Calendar,
  Building2,
  Eye,
  BookOpen,
  X,
  SlidersHorizontal,
  EyeOff,
} from 'lucide-react';

const SearchPapers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    university: searchParams.get('university') || '',
    department: searchParams.get('department') || '',
    course: searchParams.get('course') || '',
    semester: searchParams.get('semester') || '',
    year: searchParams.get('year') || '',
    paperType: searchParams.get('paperType') || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['papers', filters, sortBy, page],
    async ({ queryKey }) => {
      const [_key, filters, sortBy, page] = queryKey;
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const [sortField, sortOrder] = (sortBy === 'newest' ? 'createdAt:desc' : 'downloadCount:desc').split(':');
      
      params.append('page', page);
      params.append('visibility', 'public');
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);

      const response = await apiClient.get(`/papers?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Add console logs for debugging
  console.log("Papers data:", data);
  console.log("Papers loading:", isLoading);
  console.log("Papers error:", error);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const clearFilters = () => {
    setFilters({
      search: '',
      university: '',
      department: '',
      course: '',
      semester: '',
      year: '',
      paperType: '',
    });
    setPage(1);
  };

  const paperTypes = [
    { value: 'mid', label: 'Midterm' },
    { value: 'final', label: 'Final' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Past Papers</h1>
          <p className="text-gray-600">
            Discover and download past papers from various universities and courses
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by course, paper title, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Sort and Filter Buttons */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center space-x-2 ${
                  hasActiveFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(filters).filter(v => v !== '').length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center space-x-2 text-error-600 hover:text-error-700"
                >
                  <X className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    University
                  </label>
                  <input
                    type="text"
                    value={filters.university}
                    onChange={(e) => handleFilterChange('university', e.target.value)}
                    className="input-field"
                    placeholder="Filter by university"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="input-field"
                    placeholder="Filter by department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={filters.course}
                    onChange={(e) => handleFilterChange('course', e.target.value)}
                    className="input-field"
                    placeholder="Filter by course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Fall 2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Type
                  </label>
                  <select
                    value={filters.paperType}
                    onChange={(e) => handleFilterChange('paperType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    {paperTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {data?.total || 0} papers found
                </h2>
                {hasActiveFilters && (
                  <p className="text-sm text-gray-600 mt-1">
                    Filtered results
                  </p>
                )}
              </div>
            </div>

            {/* Papers Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading papers</h3>
                <p className="text-gray-600">Please try again later</p>
              </div>
            ) : data?.papers?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="papers-grid">
                {data.papers.map((paper) => (
                  <PaperCard key={paper._id} paper={paper} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more results'
                    : 'Be the first to upload a paper for this criteria'
                  }
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link to="/upload" className="btn-primary">
                    Upload Paper
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {(data?.totalPages ?? 0) > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        data?.currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Papers</span>
                  <span className="font-semibold text-gray-900">{data?.total || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Universities</span>
                  <span className="font-semibold text-gray-900">25+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Departments</span>
                  <span className="font-semibold text-gray-900">50+</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Popular Courses</h4>
                <div className="space-y-2">
                  {['Computer Science', 'Electrical Engineering', 'Mathematics', 'Physics'].map(course => (
                    <button
                      key={course}
                      onClick={() => handleFilterChange('course', course)}
                      className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaperCard = ({ paper }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const userId = user?._id || user?.id;
  const hasVoted = paper.votedBy?.includes(userId);

  const voteMutation = useMutation(
    ({ paperId, isVoting }) => apiClient.put(`/papers/${paperId}/vote`, { vote: isVoting }),
    {
      onMutate: async ({ paperId, isVoting }) => {
        await queryClient.cancelQueries(['papers']);
        const previousPapersData = queryClient.getQueryData(['papers']);

        queryClient.setQueryData(['papers'], (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            papers: page.papers.map((p) => {
              if (p._id === paperId) {
                const newVotedBy = isVoting
                  ? [...(p.votedBy || []), userId]
                  : (p.votedBy || []).filter((id) => id !== userId);
                return {
                  ...p,
                  votedBy: newVotedBy,
                  votes: newVotedBy.length,
                };
              }
              return p;
            }),
          }));

          return { ...oldData, pages: newPages };
        });

        return { previousPapersData };
      },
      onError: (err, variables, context) => {
        if (context.previousPapersData) {
          queryClient.setQueryData(['papers'], context.previousPapersData);
        }
        toast.error('Something went wrong. Please try again.');
      },
      onSettled: () => {
        queryClient.invalidateQueries(['papers']);
      },
    }
  );

  const handleVote = (e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    voteMutation.mutate({ paperId: paper._id, isVoting: !hasVoted });
  };
  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <Link to={`/papers/${paper._id}`} className="block card group hover:shadow-lg transition-all duration-200 p-6">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-4">
            {paper.title}
          </h3>
          <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-full whitespace-nowrap">
            {paper.paperType}
          </span>
        </div>
        {paper.teacher && (
          <p className="text-xs text-gray-500 mt-2">
            Teacher: {paper.teacher}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2 truncate">
          {paper.course} 
          {paper.courseCode && ` • ${paper.courseCode}`}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span className="truncate pr-2">{paper.university}</span>
          <span className="truncate">{paper.department}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-1.5" />
              {paper.downloadCount}
            </span>
            <button onClick={handleVote} className={`flex items-center space-x-1.5 hover:text-primary-600 ${hasVoted ? 'text-primary-600' : ''}`}>
              <ThumbsUp className="h-4 w-4" />
              <span>{Array.isArray(paper.votedBy) ? paper.votedBy.length : paper.helpfulVotes || 0}</span>
            </button>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1.5" />
              {paper.views || 0}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-primary-600 hover:text-primary-700 font-medium text-xs group-hover:underline">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </>
  );
};


export default SearchPapers;