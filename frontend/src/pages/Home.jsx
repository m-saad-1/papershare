import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '@/apiClient';
import { useAuth } from '@/context/AuthContext';
import LazyImage, { LazyAvatar } from '@/components/ui/LazyImage';
import {
  Search,
  Upload,
  Download,
  ThumbsUp,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Building2,
  TrendingUp,
  Crown,
  ChevronRight,
  Filter,
  Calendar,
  Eye,
  X
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    department: '',
    course: ''
  });

  const filterFields = [
    { key: 'university', label: 'University', icon: Building2 },
    { key: 'department', label: 'Department', icon: BookOpen },
    { key: 'course', label: 'Course', icon: GraduationCap },
  ];

  const { data: trendingPapers, isLoading } = useQuery(
    'trending-papers',
    async () => {
      const response = await apiClient.get('/papers?limit=6&sort=-downloadCount');
      return response.data.papers;
    },
    {
      staleTime: 5 * 60 * 1000,
      select: (papers) => {
        if (!papers) return [];
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return papers.map(paper => {
          if (paper.uploader?.profilePhoto && !paper.uploader.profilePhoto.startsWith('http')) {
            const photoPath = paper.uploader.profilePhoto.startsWith('/')
              ? paper.uploader.profilePhoto.slice(1)
              : paper.uploader.profilePhoto;
            return {
              ...paper,
              uploader: {
                ...paper.uploader,
                profilePhoto: `${apiBaseUrl}/${photoPath}`,
              },
            };
          }
          return paper;
        });
      },
    }
  );

  const { data: stats } = useQuery('public-social-stats', async () => {
    const response = await apiClient.get('/users/stats/public');
    return response.data;
  });

  const { data: userPapers } = useQuery(
    'user-papers-home',
    async () => {
      const response = await apiClient.get('/papers/user/my-papers');
      return response.data;
    },
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: weeklyTopContributors, isLoading: isWeeklyLoading } = useQuery(
    'weekly-top-contributors-home',
    async () => {
      const response = await apiClient.get('/users/leaderboard/weekly?limit=5');
      return response.data;
    },
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchTerm) queryParams.append('search', searchTerm);
    if (filters.university) queryParams.append('university', filters.university);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.course) queryParams.append('course', filters.course);

    navigate(`/papers?${queryParams.toString()}`);
  };

  const features = [
    {
      name: 'Easy Upload',
      description: 'Upload past papers in seconds with our intuitive form and automatic metadata extraction.',
      icon: Upload,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      name: 'Smart Search',
      description: 'Advanced filtering by university, department, course, and year with real-time results.',
      icon: Search,
      color: 'text-green-600 bg-green-50'
    },
    {
      name: 'Quality Assurance',
      description: 'All papers are verified by our admin team to ensure accuracy and relevance.',
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      name: 'Community Driven',
      description: 'Join thousands of students sharing resources to help each other succeed.',
      icon: Users,
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Sign Up',
      description: 'Create your free account in under 2 minutes',
      icon: Users
    },
    {
      step: 2,
      title: 'Upload or Browse',
      description: 'Share your papers or explore existing resources',
      icon: Upload
    },
    {
      step: 3,
      title: 'Download & Study',
      description: 'Access high-quality study materials instantly',
      icon: Download
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="text-center">
            {/* Hero Title - Fluid typography */}
            <h1 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-bold tracking-tight mb-4 md:mb-6">
              Access Past Papers.
              <span className="block text-primary-200 mt-1 md:mt-2">Upload. Download. Succeed.</span>
            </h1>

            {/* Subheader - Fluid typography */}
            <p className="text-fluid-base sm:text-fluid-lg lg:text-fluid-xl text-primary-100 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-2 sm:px-4">
              Find verified exam resources in seconds, share your own papers, and help students across universities study smarter together.
            </p>

            {/* Search Box */}
            <div className="max-w-4xl mx-auto px-2 md:px-0">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search by course, paper title, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 sm:py-4 text-base text-gray-900 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      />
                    </div>
                  </div>
                  {/* Touch-friendly search button */}
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 text-base font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200"
                  >
                    <span className="hidden sm:inline">Search Papers</span>
                    <span className="sm:hidden">Search</span>
                  </button>
                </div>

                {/* Filter Toggle for Mobile */}
                <div className="sm:hidden flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 text-sm text-primary-200 hover:text-white min-h-touch px-4"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    <ChevronRight className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                  </button>
                  {Object.values(filters).some(v => v) && (
                    <button
                      type="button"
                      onClick={() => setFilters({ university: '', department: '', course: '' })}
                      className="flex items-center justify-center gap-1 text-sm text-red-300 hover:text-white min-h-touch px-3"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Filters - Mobile collapsed, Desktop always visible */}
                {/* Desktop Filters */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  {filterFields.map(field => (
                    <div key={field.key} className="relative group">
                      <field.icon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        placeholder={field.label}
                        value={filters[field.key]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      />
                    </div>
                  ))}
                </div>
                {/* Mobile Filters Container */}
                {showFilters && (
                  <div className="sm:hidden mt-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="grid grid-cols-1 gap-4">
                      {filterFields.map(field => (
                        <div key={field.key}>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <field.icon className="h-4 w-4 mr-2 text-primary-600" />
                            {field.label}
                          </label>
                          <input
                            type="text"
                            placeholder={`Filter by ${field.label.toLowerCase()}`}
                            value={filters[field.key]}
                            onChange={(e) => setFilters(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 max-w-2xl mx-auto px-2 sm:px-4">
              <div className="text-center p-3 sm:p-0">
                <div className="text-fluid-xl sm:text-fluid-2xl font-bold">{stats?.totalPapers || '0'}+</div>
                <div className="text-primary-200 text-xs sm:text-sm mt-1">Papers Available</div>
              </div>
              <div className="text-center p-3 sm:p-0">
                <div className="text-fluid-xl sm:text-fluid-2xl font-bold">{stats?.totalDepartments || '0'}+</div>
                <div className="text-primary-200 text-xs sm:text-sm mt-1">Total Departments</div>
              </div>
              <div className="text-center p-3 sm:p-0">
                <div className="text-fluid-xl sm:text-fluid-2xl font-bold">{stats?.totalStudents || '0'}+</div>
                <div className="text-primary-200 text-xs sm:text-sm mt-1">Students Using</div>
              </div>
              <div className="text-center p-3 sm:p-0">
                <div className="text-fluid-xl sm:text-fluid-2xl font-bold">{stats?.openRequests || '0'}</div>
                <div className="text-primary-200 text-xs sm:text-sm mt-1">Paper Requests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-16">
            <h2 className="text-fluid-2xl sm:text-fluid-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Why Choose PaperShare?
            </h2>
            <p className="text-fluid-base sm:text-fluid-lg text-gray-600 max-w-2xl mx-auto px-2">
              We're building the largest community-driven repository of academic resources
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center group p-3 sm:p-4 md:p-0">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-200 ${feature.color}`}>
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                </div>
                <h3 className="text-fluid-sm sm:text-fluid-base md:text-fluid-lg font-semibold text-gray-900 mb-2 md:mb-3">
                  {feature.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed px-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Improved responsive spacing */}
      <section className="py-10 sm:py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-16">
            <h2 className="text-fluid-2xl sm:text-fluid-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-fluid-base sm:text-fluid-lg text-gray-600 px-2">
              Join thousands of students already using PaperShare
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200 z-0"></div>
                )}

                <div className="relative z-10 bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm md:shadow-soft border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-100 text-primary-600 rounded-full font-bold text-base md:text-lg mb-3 md:mb-4">
                    {step.step}
                  </div>
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-600 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-fluid-base sm:text-fluid-lg font-semibold text-gray-900 mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="btn-primary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/upload"
                className="btn-primary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
              >
                {userPapers && userPapers.length > 0 ? 'Upload Paper' : 'Upload Your First Paper'}
                <Upload className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trending Papers */}
      <section className="py-10 sm:py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8 md:mb-12">
            <div>
              <h2 className="text-fluid-xl sm:text-fluid-2xl font-bold text-gray-900">Trending Papers</h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">Most downloaded papers this week</p>
            </div>
            <Link
              to="/papers"
              className="hidden sm:inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors"
            >
              View All Papers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton-title mb-3"></div>
                  <div className="skeleton-text w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingPapers?.map((paper) => (
                <Link key={paper._id} to={`/papers/${paper._id}`} className="block card-interactive p-4 sm:p-6 group">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 text-fluid-sm sm:text-fluid-base">
                      {paper.title}
                    </h3>
                    <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {paper.paperType}
                    </span>
                  </div>

                  {paper.teacher && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                      Teacher: {paper.teacher}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                    {paper.course}
                    {paper.courseCode && ` • ${paper.courseCode}`}
                  </p>

                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Uploaded {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : 'recently'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span className="line-clamp-1 pr-2">{paper.university}</span>
                    <span className="line-clamp-1 text-right">{paper.department}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {paper.downloadCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {Array.isArray(paper.votedBy) ? paper.votedBy.length : paper.helpfulVotes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {paper.views || 0}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 group-hover:border-primary-200 group-hover:text-primary-600 transition-colors duration-200">
                      View Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && (!trendingPapers || trendingPapers.length === 0) && (
            <div className="text-center py-8 md:py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-fluid-lg font-medium text-gray-900 mb-2">No papers yet</h3>
              <p className="text-gray-500 text-fluid-sm mb-6 px-2">
                Be the first to upload a paper and help fellow students!
              </p>
              {isAuthenticated ? (
                <Link to="/upload" className="btn-primary">
                  Upload Paper
                </Link>
              ) : (
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              )}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-6 sm:hidden">
            <Link
              to="/papers"
              className="btn-secondary w-full justify-center"
            >
              View All Papers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Contributors This Week Section */}
      <section className="py-8 sm:py-10 md:py-14 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-fluid-lg sm:text-fluid-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                Top Contributors This Week
              </h2>
              <p className="text-sm text-gray-600 mt-1">Top 5 contributors ranked by weekly contribution points</p>
            </div>
            <Link
              to="/leaderboard"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm min-h-touch flex items-center"
            >
              View Full Leaderboard
            </Link>
          </div>

          {isWeeklyLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="card p-4 h-24">
                  <div className="skeleton-text w-1/4 mb-2"></div>
                  <div className="skeleton-title mb-2"></div>
                  <div className="skeleton-text w-1/2"></div>
                </div>
              ))}
            </div>
          ) : weeklyTopContributors?.users?.length ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {weeklyTopContributors.users.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user._id}`}
                  className="card-interactive p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">#{user.rank}</span>
                    {user.rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                  <p className="text-xs text-primary-700 mt-1">{Number(user.weeklyPoints || 0).toLocaleString()} weekly pts</p>
                  <p className="text-xs text-gray-600">{Number(user.points || 0).toLocaleString()} total reputation</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-gray-600">
              No contributor activity recorded yet this week.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;