import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext.jsx';
import {
  User,
  Upload,
  Download,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Key,
  EyeOff,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, token, isAdmin } = useAuth(); // 1. Get token from AuthContext
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const modalRef = React.useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);


  const { data: papers, isLoading } = useQuery(
    [isAdmin ? 'all-papers' : 'user-papers', isAdmin],
    async () => {
      const url = isAdmin ? '/admin/papers/all' : '/papers/user/my-papers';
      const response = await axios.get(url);
      return response.data;
    },
    {
      enabled: !!token,
    }
  );

  const { data: downloadedPapers, isLoading: isLoadingDownloads } = useQuery(
    'user-downloads',
    async () => {
      // The global axios instance from AuthContext will handle the Authorization header
      const response = await axios.get('/papers/user/my-downloads');
      return response.data;
    },
    {
      // This query will only run if the token exists and the tab is active
      enabled: !!token && activeTab === 'downloads',
    }
  );

  const stats = {
    totalUploads: isAdmin ? papers?.papers?.length || 0 : papers?.length || 0,
    totalDownloads: isAdmin ? papers?.papers?.reduce((sum, paper) => sum + paper.downloadCount, 0) || 0 : papers?.reduce((sum, paper) => sum + paper.downloadCount, 0) || 0,
    approvedPapers: isAdmin ? papers?.papers?.filter(paper => paper.status === 'approved').length || 0 : papers?.filter(paper => paper.status === 'approved').length || 0,
    pendingPapers: isAdmin ? papers?.papers?.filter(paper => paper.status === 'pending').length || 0 : papers?.filter(paper => paper.status === 'pending').length || 0,
  };

  const deletePaperMutation = useMutation(
    (paperId) => axios.delete(`/papers/${paperId}`),
    {
      onSuccess: () => {
        toast.success('Paper deleted successfully!');
        queryClient.invalidateQueries(isAdmin ? 'all-papers' : 'user-papers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete paper.');
      },
    }
  );

  const updatePaperVisibilityMutation = useMutation(
    ({ paperId, visibility }) => axios.patch(`/papers/${paperId}`, { visibility }),
    {
      onSuccess: (data) => {
        const newVisibility = data.data.visibility;
        toast.success(`Paper is now ${newVisibility}.`);
        queryClient.invalidateQueries(isAdmin ? 'all-papers' : 'user-papers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update paper visibility.');
      },
      onSettled: () => {
        setOpenMenuId(null); // Close menu after action
      }
    }
  );

  const changePasswordMutation = useMutation(
    async (passwords) => {
      const response = await axios.post('/auth/change-password', passwords);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        setPasswordFields({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setIsChangePasswordModalOpen(false);
        setFormError(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to change password.';
        toast.error(errorMessage);
        setFormError(errorMessage);
      },
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success-600 bg-success-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      case 'rejected': return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (paperId) => {
    setOpenMenuId(openMenuId === paperId ? null : paperId);
  };

  const handleEdit = (paperId) => {
    console.log("Edit paper:", paperId);
    navigate(`/edit-paper/${paperId}`);
  };
  const handleMakePrivate = (paperId, currentVisibility) => {
    const newVisibility = currentVisibility === 'private' ? 'public' : 'private';
    updatePaperVisibilityMutation.mutate({ paperId, visibility: newVisibility });
  };
  const handleDelete = (paperId) => {
    if (window.confirm('Are you sure you want to permanently delete this paper?')) {
      deletePaperMutation.mutate(paperId);
    }
  };

  const handleChangePassword = () => {
    setPasswordFields({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setFormError(null);
    setIsChangePasswordModalOpen(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsChangePasswordModalOpen(false);
        setFormError(null);
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsChangePasswordModalOpen(false);
      }
    };

    if (isChangePasswordModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setFormError(null); // Clear form error when modal opens
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isChangePasswordModalOpen]);

  const getVisibilityText = (visibility) => {
    return visibility === 'private' ? 'Make Public' : 'Make Private';
  };

  return (
    <>
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div ref={modalRef} className="card p-6 max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 animate-fade-in-scale">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Key className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              </div>
              <button onClick={() => setIsChangePasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700 flex items-center">
                  <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {formError}
                </p>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate(passwordFields);
            }}>
              <div className="space-y-5 mt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter your current password"
                      value={passwordFields.currentPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, currentPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter your new password"
                      value={passwordFields.newPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, newPassword: e.target.value})}
                    />
                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Confirm your new password"
                      value={passwordFields.confirmNewPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, confirmNewPassword: e.target.value})}
                    />
                     <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordFields.confirmNewPassword && passwordFields.newPassword !== passwordFields.confirmNewPassword && (
                    <p className="mt-1 text-sm text-error-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    setFormError(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:bg-primary-300 disabled:cursor-not-allowed"
                  disabled={
                    !passwordFields.currentPassword ||
                    !passwordFields.newPassword ||
                    !passwordFields.confirmNewPassword ||
                    passwordFields.newPassword !== passwordFields.confirmNewPassword ||
                    changePasswordMutation.isLoading
                  }
                >
                  {changePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Upload className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <Download className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Papers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedPapers}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPapers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.username}</p>
                  <p className="text-sm text-gray-600">{user?.university}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('my-papers')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'my-papers'
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isAdmin ? 'All Papers' : 'My Papers'}
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'downloads'
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Downloads
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Settings
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/upload"
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Paper
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  {(isAdmin ? papers?.papers?.length > 0 : papers?.length > 0) ? (
                    <div className="space-y-4">
                      {(isAdmin ? papers.papers : papers).slice(0, 5).map((paper) => (
                        <div key={paper._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{paper.title}</p>
                              <p className="text-sm text-gray-600">
                                {paper.course} • {paper.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`badge ${getStatusColor(paper.status)} flex items-center space-x-1`}>
                              {getStatusIcon(paper.status)}
                              <span>{getStatusText(paper.status)}</span>
                            </span>
                            <span className="text-sm text-gray-500">
                              {paper.downloadCount} downloads
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
                      <p className="text-gray-600 mb-4">Start sharing your past papers with the community</p>
                      <Link to="/upload" className="btn-primary">
                        Upload Your First Paper
                      </Link>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Upload</h3>
                    <p className="text-gray-600 mb-4">Share a new past paper with the community.</p>
                    <Link to="/upload" className="btn-primary w-full flex items-center justify-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Paper
                    </Link>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Papers</h3>
                    <p className="text-gray-600 mb-4">Discover papers from other students.</p>
                    <Link to="/papers" className="btn-secondary w-full flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Browse All Papers
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'my-papers' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{isAdmin ? 'All Papers' : 'My Papers'}</h2>
                  <Link to="/upload" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Paper
                  </Link>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (isAdmin ? papers?.papers?.length > 0 : papers?.length > 0) ? (
                  <div className="space-y-4">
                    {(isAdmin ? papers.papers : papers).map((paper) => (
                      <div key={paper._id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {paper.title}
                                  </h3>                                  
                                  {paper.teacher && (
                                    <p className="text-gray-500 text-sm mb-1">Teacher: {paper.teacher}</p>
                                  )}
                                  <p className="text-gray-600 text-sm">
                                    {paper.course} • {paper.courseCode} • {paper.department}
                                  </p>

                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
                                      {paper.paperType}
                                    </span>
                                    <span>•</span>
                                    <span>{paper.university}</span>
                                    <span>•</span>
                                    <span>{paper.year}</span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Download className="h-3 w-3 mr-1" />
                                      {paper.downloadCount} downloads
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Eye className="h-3 w-3 mr-1" /> 
                                      {paper.views || 0} views
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <span className={`badge ${getStatusColor(paper.status)} flex items-center space-x-1`}>
                                {getStatusIcon(paper.status)}
                                <span>{getStatusText(paper.status)}</span>
                              </span>
                              <div className="relative">
                                <button
                                  onClick={() => handleMenuClick(paper._id)}
                                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {openMenuId === paper._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleEdit(paper._id)}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleMakePrivate(paper._id, paper.visibility)}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        {getVisibilityText(paper.visibility)}
                                      </button>
                                      {(paper.status !== 'approved' || isAdmin) && (
                                        <button
                                          onClick={() => handleDelete(paper._id)}
                                          className="w-full text-left flex items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Start sharing your past papers with the community</p>
                    <Link to="/upload" className="btn-primary">
                      Upload Your First Paper
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Download History</h2>
                {isLoadingDownloads ? (
                  <div className="text-center py-8">
                    <p>Loading download history...</p>
                  </div>
                ) : downloadedPapers && downloadedPapers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paper Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Downloaded On
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {downloadedPapers.map((download) => (
                          <tr key={download._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{download.paper.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{download.paper.course}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(download.downloadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/papers/${download.paper._id}`} className="text-primary-600 hover:text-primary-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
                    <p className="text-gray-600 mb-4">Papers you download will appear here</p>
                    <Link to="/papers" className="btn-primary">
                      Browse Papers
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input type="text" defaultValue={user?.username} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="input-field bg-gray-50"
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.university}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.department}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => toast.success('Profile updated successfully! (Demo)')}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <button onClick={handleChangePassword} className="btn-secondary w-full flex items-center justify-center">
                        <Key className="h-4 w-4 mr-2" /> Change Password
                      </button>
                      <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>    </div>
    </>
  );
};

export default Dashboard;