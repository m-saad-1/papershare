import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
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
  SlidersHorizontal
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

  const { data, isLoading, error } = useQuery(
    ['papers', { ...filters, sortBy }],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('sort', sortBy === 'newest' ? 'createdAt:desc' : 'downloadCount:desc');
      
      const response = await axios.get(`/papers?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {data?.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        data.currentPage === page
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

  const voteMutation = useMutation(
    ({ paperId, isVoting }) => axios.put(`/papers/${paperId}/vote`, { vote: isVoting }),
    {
      onMutate: async ({ paperId, isVoting }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('papers');

        // Snapshot the previous value
        const previousPapersData = queryClient.getQueryData('papers');

        // Optimistically update to the new value
        queryClient.setQueryData('papers', (oldData) => {
          if (!oldData) return;

          const newPapers = oldData.papers.map((p) => {
            if (p._id === paperId) {
              const userId = user?._id || user?.id;
              const currentVotes = p.helpfulVotes || 0;
              const currentVoters = Array.isArray(p.votedBy) ? p.votedBy : [];

              return {
                ...p,
                helpfulVotes: isVoting ? currentVotes + 1 : Math.max(0, currentVotes - 1),
                votedBy: isVoting
                  ? [...currentVoters, userId]
                  : currentVoters.filter(voterId => voterId !== userId),
              };
            }
            return p;
          });

          return { ...oldData, papers: newPapers };
        });

        // Return a context object with the snapshotted value
        return { previousPapersData };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData('papers', context.previousPapersData);
        toast.error(err.response?.data?.message || 'Failed to update vote.');
      },
      onSettled: () => {
        // Invalidate to refetch and sync with the server
        queryClient.invalidateQueries('papers');
      },
    }
  );

  const handleVote = (e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      navigate('/login');
      return;
    }
    const userId = user?._id || user?.id;
    const hasVoted = paper.votedBy?.includes(userId);
    voteMutation.mutate({ paperId: paper._id, isVoting: !hasVoted });
  };

  const hasVoted = isAuthenticated && paper.votedBy?.includes(user?._id || user?.id);

  const getPaperTypeColor = (type) => {
    switch (type) {
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'final': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'assignment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaperTypeLabel = (type) => {
    switch (type) {
      case 'mid': return 'Midterm';
      case 'final': return 'Final';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      default: return type;
    }
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-1">
              {paper.title}
            </h3>
            {paper.teacher && (
              <p className="text-gray-500 text-sm mb-1">
                Teacher: {paper.teacher}
              </p>
            )}
            <p className="text-gray-600 text-sm">
              {paper.course} • {paper.courseCode}
            </p>
          </div>
          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className={`badge ${getPaperTypeColor(paper.paperType)}`}>
            {getPaperTypeLabel(paper.paperType)}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{paper.year}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            {paper.university}
          </span>
          <span>{paper.department}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              {paper.downloadCount}
            </span>
            <button
              onClick={handleVote}
              disabled={voteMutation.isLoading}
              className={`flex items-center transition-colors duration-200 ${hasVoted ? 'text-primary-600' : 'hover:text-primary-600'}`}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${hasVoted ? 'fill-current' : ''}`} />
              {paper.helpfulVotes}
            </button>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {paper.views || 0}
            </span>
          </div>
          <Link
            to={`/papers/${paper._id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:underline transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchPapers;