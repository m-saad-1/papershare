import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '@/apiClient';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Upload,
  Download,
  Star,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Building2,
  TrendingUp,
  ChevronRight,
  Filter,
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

  const { data: stats } = useQuery('stats', async () => {
    const response = await apiClient.get('/papers?limit=1');
    const papers = response.data.papers || [];
    return {
      totalPapers: response.data.total,
      totalDownloads: papers.reduce((sum, paper) => sum + paper.downloadCount, 0)
    };
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center">
            {/* Hero Title - Larger on mobile */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              Share Knowledge.
              <span className="block text-primary-200 mt-1 md:mt-2">Excel Together.</span>
            </h1>
            
            {/* Subheader - Smaller on mobile */}
            <p className="text-base md:text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Access thousands of past papers, assignments, and quizzes from universities worldwide. 
              Join our community of learners helping each other succeed.
            </p>
            
            {/* Search Box */}
            <div className="max-w-4xl mx-auto px-2 md:px-0">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 md:h-5 w-4 md:w-5" />
                      <input
                        type="text"
                        placeholder="Search by course, paper title, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 md:pl-10 md:pr-4 py-3 md:py-4 text-sm md:text-base text-gray-900 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      />
                    </div>
                  </div>
                  {/* Mobile: Compact button | Desktop: Normal button */}
                  <button
                    type="submit"
                    className="w-auto px-12 md:px-12 py-3 md:py-4 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-sm md:text-base"
                  >
                    <span className="hidden md:inline">Search Papers</span>
                    <span className="md:hidden">Search</span>
                  </button>
                </div>
                
                {/* Filter Toggle for Mobile */}
                <div className="md:hidden flex items-center justify-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 text-sm text-primary-200 hover:text-white"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    <ChevronRight className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                  </button>
                  {Object.values(filters).some(v => v) && (
                    <button
                      type="button"
                      onClick={() => setFilters({ university: '', department: '', course: '' })}
                      className="flex items-center justify-center gap-1 text-sm text-red-300 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Filters - Mobile collapsed, Desktop always visible */}
                {/* Desktop Filters */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
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
                  <div className="md:hidden mt-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
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
                            className="w-full px-3 py-3 text-sm text-gray-900 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-10 md:mt-12 max-w-2xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stats?.totalPapers || '0'}+</div>
                <div className="text-primary-200 text-xs md:text-sm mt-1">Papers Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stats?.totalDownloads || '0'}+</div>
                <div className="text-primary-200 text-xs md:text-sm mt-1">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">100+</div>
                <div className="text-primary-200 text-xs md:text-sm mt-1">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">50+</div>
                <div className="text-primary-200 text-xs md:text-sm mt-1">Departments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Reduced text size and 2 cards per row on mobile */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Why Choose PaperShare?
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              We're building the largest community-driven repository of academic resources
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center group p-3 md:p-0">
                <div className={`inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-200 ${feature.color}`}>
                  <feature.icon className="h-5 w-5 md:h-8 md:w-8" />
                </div>
                <h3 className="text-sm md:text-lg lg:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                  {feature.name}
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed px-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Reduced spacing and text sizes for mobile */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-base md:text-xl text-gray-600 px-2">
              Join thousands of students already using PaperShare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200 z-0"></div>
                )}
                
                <div className="relative z-10 bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm md:shadow-soft border border-gray-100 hover:shadow-md md:hover:shadow-card transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-primary-100 text-primary-600 rounded-full font-bold text-sm md:text-lg mb-3 md:mb-4">
                    {step.step}
                  </div>
                  <step.icon className="h-6 w-6 md:h-8 md:w-8 text-primary-600 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-base text-gray-600 leading-relaxed">
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
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg transition-all duration-200 px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            ) : (
              <Link
                to="/upload"
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg transition-all duration-200 px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg"
              >
                {userPapers && userPapers.length > 0 ? 'Upload Paper' : 'Upload Your First Paper'}
                <Upload className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trending Papers */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Papers</h2>
              <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">Most downloaded papers this week</p>
            </div>
            <Link
              to="/papers"
              className="hidden md:inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors"
            >
              View All Papers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPapers?.map((paper) => (
                <div key={paper._id} className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 text-sm md:text-base flex-1 pr-2">
                      {paper.title}
                    </h3>
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  
                  {paper.teacher && (
                    <p className="text-gray-500 text-xs md:text-sm mb-2">
                      Teacher: {paper.teacher}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs md:text-sm mb-4">
                    {paper.course} • {paper.courseCode}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4">
                    <span>{paper.university}</span>
                    <span>{paper.department}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center">
                        <Download className="h-3 w-3 md:h-4 w-4 mr-1" />
                        {paper.downloadCount}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 md:h-4 w-4 mr-1" />
                        {paper.helpfulVotes}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 md:h-4 w-4 mr-1" />
                        {paper.views || 0}
                      </span>
                    </div>
                    <Link
                      to={`/papers/${paper._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-xs md:text-sm group-hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!trendingPapers || trendingPapers.length === 0) && (
            <div className="text-center py-8 md:py-12">
              <FileText className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1 md:mb-2">No papers yet</h3>
              <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6 px-2">
                Be the first to upload a paper and help fellow students!
              </p>
              {isAuthenticated ? (
                <Link to="/upload" className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg px-6 py-3 text-sm md:text-base">
                  Upload Paper
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg px-6 py-3 text-sm md:text-base">
                  Get Started
                </Link>
              )}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-8 md:hidden">
            <Link
              to="/papers"
              className="block w-full py-3 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors text-sm"
            >
              View All Papers
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;