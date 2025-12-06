import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Upload,
  Download,
  Star,
  Users,
  FileText,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    university: '',
    department: '',
    course: ''
  });

  const { data: trendingPapers, isLoading } = useQuery(
    'trending-papers',
    async () => {
      const response = await axios.get('/papers?limit=6&sort=-downloadCount');
      return response.data.papers;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: stats } = useQuery('stats', async () => {
    const response = await axios.get('/papers?limit=1');
    return {
      totalPapers: response.data.total,
      totalDownloads: response.data.papers.reduce((sum, paper) => sum + paper.downloadCount, 0)
    };
  });

  const { data: userPapers } = useQuery(
    'user-papers-home',
    async () => {
      const response = await axios.get('/papers/user/my-papers');
      return response.data;
    },
    {
      enabled: isAuthenticated, // Use isAuthenticated from AuthContext
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Share Knowledge.
              <span className="block text-primary-200">Excel Together.</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Access thousands of past papers, assignments, and quizzes from universities worldwide. 
              Join our community of learners helping each other succeed.
            </p>
            
            {/* Search Box */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by course, paper title, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 text-gray-900 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    Search Papers
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="University"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                    className="px-4 py-3 text-gray-900 rounded-lg border-0 shadow focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="px-4 py-3 text-gray-900 rounded-lg border-0 shadow focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Course"
                    value={filters.course}
                    onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                    className="px-4 py-3 text-gray-900 rounded-lg border-0 shadow focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats?.totalPapers || '0'}+</div>
                <div className="text-primary-200 text-sm">Papers Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats?.totalDownloads || '0'}+</div>
                <div className="text-primary-200 text-sm">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-primary-200 text-sm">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-primary-200 text-sm">Departments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PaperShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building the largest community-driven repository of academic resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of students already using PaperShare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200 z-0"></div>
                )}
                
                <div className="relative z-10 bg-white rounded-2xl p-8 shadow-soft border border-gray-100 hover:shadow-card transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <step.icon className="h-8 w-8 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/upload"
                className="btn-primary text-lg px-8 py-4"
              >
                {userPapers && userPapers.length > 0 ? 'Upload Paper' : 'Upload Your First Paper'}
                <Upload className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trending Papers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Papers</h2>
              <p className="text-gray-600 mt-2">Most downloaded papers this week</p>
            </div>
            <Link
              to="/papers"
              className="btn-secondary"
            >
              View All Papers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPapers?.map((paper) => (
                <div key={paper._id} className="card group hover:shadow-lg transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-1">
                        {paper.title}
                      </h3>
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    {paper.teacher && (
                      <p className="text-gray-500 text-sm mb-1">
                        Teacher: {paper.teacher}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4">
                      {paper.course} • {paper.courseCode}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{paper.university}</span>
                      <span>{paper.department}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {paper.downloadCount}
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {paper.helpfulVotes}
                        </span>
                      </div>
                      <Link
                        to={`/papers/${paper._id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!trendingPapers || trendingPapers.length === 0) && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No papers yet</h3>
              <p className="text-gray-500 mb-6">Be the first to upload a paper and help fellow students!</p>
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
        </div>
      </section>
    </div>
  );
};

export default Home;