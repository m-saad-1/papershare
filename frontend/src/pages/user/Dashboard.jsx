import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import apiClient from '@/apiClient';
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
  Menu,
  X,
  Home,
  File,
  Settings,
} from 'lucide-react';
import { Crown, TrendingUp } from 'lucide-react';
import { ThumbsUp } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, token, isAdmin, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const profilePictureInputRef = React.useRef(null);

  const modalRef = React.useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  // State for editable profile fields
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    university: user?.university || '',
    department: user?.department || '',
    semester: user?.semester || '',
    batch: user?.batch || '',

  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        university: user.university || '',
        department: user.department || '',
        semester: user.semester || '',
        batch: user.batch || '',
      });
      if (user.profilePicture) {
        setProfilePicturePreview(`${apiClient.defaults.baseURL.replace('/api', '')}/${user.profilePicture.replace(/\\/g, '/')}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateProfileMutation = useMutation(
    (formData) => apiClient.put(`/users/${user._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    {
      onSuccess: (data) => {
        toast.success('Profile updated successfully!');
        const updatedUser = data.data;
        updateUserContext(updatedUser);
        setProfilePictureFile(null); // Clear the file input after successful upload
      },
      onError: (error) => {
        console.error("updateProfileMutation error:", error);
        toast.error(error.response?.data?.message || 'Failed to update profile.');
      },
    }
  );

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      formData.append(key, profileData[key]);
    });

    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }

    updateProfileMutation.mutate(formData);
  };

  const { data: papers, isLoading } = useQuery(
    [isAdmin ? 'all-papers' : 'user-papers', isAdmin],
    async () => {
      const url = isAdmin ? '/admin/papers/all' : '/papers/user/my-papers';
      const response = await apiClient.get(url);
      return response.data;
    },
    {
      enabled: !!token,
    }
  );

  const { data: downloadedPapers, isLoading: isLoadingDownloads } = useQuery(
    'user-downloads',
    async () => {
      const response = await apiClient.get('/papers/user/my-downloads');
      return response.data;
    },
    {
      enabled: !!token && activeTab === 'downloads',
    }
  );

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery('leaderboard-widget', async () => {
    const response = await apiClient.get('/users/leaderboard?limit=5');
    return response.data;
  }, {
    enabled: activeTab === 'overview',
  });

  const stats = {
    totalUploads: isAdmin ? papers?.papers?.length || 0 : papers?.length || 0,
    totalDownloads: isAdmin ? papers?.papers?.reduce((sum, paper) => sum + paper.downloadCount, 0) || 0 : papers?.reduce((sum, paper) => sum + paper.downloadCount, 0) || 0,
    approvedPapers: isAdmin ? papers?.papers?.filter(paper => paper.status === 'approved').length || 0 : papers?.filter(paper => paper.status === 'approved').length || 0,
    pendingPapers: isAdmin ? papers?.papers?.filter(paper => paper.status === 'pending').length || 0 : papers?.filter(paper => paper.status === 'pending').length || 0,
  };

  const deletePaperMutation = useMutation(
    (paperId) => apiClient.delete(`/papers/${paperId}`),
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
    ({ paperId, visibility }) => apiClient.patch(`/papers/${paperId}`, { visibility }),
    {
      onSuccess: (data) => {
        const newVisibility = data.data.visibility;
        toast.success(`Paper is now ${newVisibility}.`);
        queryClient.invalidateQueries(isAdmin ? 'all-papers' : 'user-papers');
        queryClient.invalidateQueries('papers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update paper visibility.');
      },
      onSettled: () => {
        setOpenMenuId(null);
      }
    }
  );

  const changePasswordMutation = useMutation(
    async (passwords) => {
      const response = await apiClient.post('/auth/change-password', passwords);
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

  const handleMenuClick = (e, paperId) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenMenuId(openMenuId === paperId ? null : paperId);
  };

  const handleEdit = (e, paperId) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/edit-paper/${paperId}`);
  };

  const handleMakePrivate = (e, paperId, currentVisibility) => {
    e.stopPropagation();
    e.preventDefault();
    const newVisibility = currentVisibility === 'private' ? 'public' : 'private';
    updatePaperVisibilityMutation.mutate({ paperId, visibility: newVisibility });
  };

  const handleDelete = (e, paperId) => {
    if (window.confirm('Are you sure you want to permanently delete this paper?')) {
      e.preventDefault();
      e.stopPropagation();
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
      setFormError(null);
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

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  const getTabIcon = (tabName) => {
    switch (tabName) {
      case 'overview': return <Home className="h-4 w-4" />;
      case 'my-papers': return <File className="h-4 w-4" />;
      case 'downloads': return <Download className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  return (
    <>
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Key className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              </div>
              <button onClick={() => setIsChangePasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700 flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  {formError}
                </p>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate(passwordFields);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter current password"
                      value={passwordFields.currentPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, currentPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter new password"
                      value={passwordFields.newPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, newPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      value={passwordFields.confirmNewPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, confirmNewPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  disabled={!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword}
                >
                  {changePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500 truncate">Welcome, {user?.username}</p>
            </div>
            {/* Mobile Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to="/upload"
                className="flex items-center justify-center px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                title="Upload Paper"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Upload</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg hidden" // Hidden as per request
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto border-t border-gray-200 bg-white">
            {['overview', 'my-papers', 'downloads', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 min-w-[100px] flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {getTabIcon(tab)}
                <span className="mt-1 capitalize">
                  {tab === 'my-papers' ? (isAdmin ? 'All' : 'My Papers') : tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 lg:mt-2">Welcome back, {user?.username}!</p>
          </div>

          <div className={`${activeTab === 'overview' ? 'grid' : 'hidden'} lg:grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8`}>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Uploads</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-success-100 rounded-lg">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-warning-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.approvedPapers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.pendingPapers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-600">{user?.university}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {['overview', 'my-papers', 'downloads', 'settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab === 'my-papers' ? (isAdmin ? 'All Papers' : 'My Papers') : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <Link
                    to="/upload"
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Paper
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{user?.username}</p>
                          <p className="text-xs text-gray-600">{user?.university}</p>
                        </div>
                      </div>
                      <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {['overview', 'my-papers', 'downloads', 'settings'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center ${
                            activeTab === tab
                              ? 'bg-primary-50 text-primary-700 border border-primary-200'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {getTabIcon(tab)}
                          <span className="ml-3 capitalize">
                            {tab === 'my-papers' ? (isAdmin ? 'All Papers' : 'My Papers') : tab}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    {(isAdmin ? papers?.papers?.length > 0 : papers?.length > 0) ? (
                      <div className="space-y-3 lg:space-y-4">
                        {(isAdmin ? papers.papers : papers).slice(0, 5).map((paper) => (
                          <div key={paper._id} className="p-3 lg:p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2 lg:space-x-3">
                                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{paper.title}</p>
                                  <p className="text-xs lg:text-sm text-gray-600 mt-1">
                                    {paper.course} • {paper.department}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(paper.status)}`}>
                                  {getStatusIcon(paper.status)}
                                  <span className="hidden sm:inline">{getStatusText(paper.status)}</span>
                                </span>
                                <span className="text-xs text-gray-500">
                                  {paper.downloadCount} downloads
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 lg:py-8">
                        <FileText className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
                        <p className="text-sm text-gray-600 mb-4">Start sharing your past papers with the community</p>
                        <Link to="/upload" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                          Upload Your First Paper
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Quick Upload</h3>
                      <p className="text-sm text-gray-600 mb-3 lg:mb-4">Share a new past paper with the community.</p>
                      <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Paper
                      </Link>
                    </div>

                    <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Browse Papers</h3>
                      <p className="text-sm text-gray-600 mb-3 lg:mb-4">Discover papers from other students.</p>
                      <Link to="/papers" className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Browse All Papers
                      </Link>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-primary-600" />
                      Top Contributors
                    </h2>
                    {isLoadingLeaderboard ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : leaderboardData && leaderboardData.length > 0 ? (
                      <div className="space-y-2 lg:space-y-3">
                        {leaderboardData.map((u) => (
                          <div
                            key={u._id}
                            className={`flex items-center p-3 rounded-lg ${user?._id === u._id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
                          >
                            <div className={`w-6 lg:w-8 text-sm lg:text-lg font-bold ${getRankColor(u.rank)}`}>
                              #{u.rank}
                            </div>
                            <div className="flex items-center flex-1 ml-2 lg:ml-3">
                              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 lg:mr-3">
                                {u.rank === 1 ? <Crown className="h-4 w-4 text-yellow-500" /> : <User className="h-4 w-4 text-gray-500" />}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm lg:text-base">{u.username}</span>
                            </div>
                            <div className="text-sm lg:text-base font-bold text-primary-600">
                              {u.points.toLocaleString()} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">No contributors yet.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'my-papers' && (
                <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{isAdmin ? 'All Papers' : 'My Papers'}</h2>
                    <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-sm">
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
                    <div className="space-y-3 lg:space-y-4">
                      {(isAdmin ? papers.papers : papers).map((paper) => (
                        <div key={paper._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group">
                          <div className="flex justify-between items-start">
                            <Link to={`/papers/${paper._id}`} className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-4 line-clamp-2">
                                {paper.title}
                              </h3>
                            </Link>
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => handleMenuClick(e, paper._id)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              {openMenuId === paper._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                                  <div className="py-1">
                                    <button onClick={(e) => handleEdit(e, paper._id)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </button>
                                    <button onClick={(e) => handleMakePrivate(e, paper._id, paper.visibility)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                      {paper.visibility === 'private' ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                      {getVisibilityText(paper.visibility)}
                                    </button>
                                    <button onClick={(e) => handleDelete(e, paper._id)} className="w-full text-left flex items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            {paper.teacher && (
                              <p className="text-xs text-gray-500">
                                Teacher: {paper.teacher}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 ml-auto">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(paper.status)}`}>
                                {getStatusText(paper.status)}
                              </span>
                              {paper.visibility === 'private' ? (
                                <span className="flex items-center text-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                  <EyeOff className="h-3 w-3 mr-1" /> Private
                                </span>
                              ) : (
                                <span className="flex items-center text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <Eye className="h-3 w-3 mr-1" /> Public
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {paper.course} {paper.courseCode && `• ${paper.courseCode}`}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span className="truncate pr-2">{paper.university}</span>
                            <span className="truncate">{paper.department}</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center" title="Downloads"><Download className="h-4 w-4 mr-1.5" />{paper.downloadCount}</span>
                              <span className="flex items-center" title="Helpful Votes"><ThumbsUp className="h-4 w-4 mr-1.5" />{Array.isArray(paper.votedBy) ? paper.votedBy.length : paper.helpfulVotes || 0}</span>
                              <span className="flex items-center" title="Views"><Eye className="h-4 w-4 mr-1.5" />{paper.views || 0}</span>
                            </div>
                            <Link to={`/papers/${paper._id}`} className="text-primary-600 hover:text-primary-700 font-medium text-xs group-hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <FileText className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
                      <p className="text-sm text-gray-600 mb-4">Start sharing your past papers with the community</p>
                      <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                        Upload Your First Paper
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">My Download History</h2>
                  {isLoadingDownloads ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : downloadedPapers && downloadedPapers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="min-w-full inline-block align-middle">
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper Title</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Course</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Downloaded On</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {downloadedPapers
                                .filter(download => download.paper) // Filter out downloads with no associated paper
                                .map((download) => (
                                  <tr key={download._id}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      <div className="truncate max-w-[150px] sm:max-w-none">{download.paper.title}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{download.paper.course}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                      {new Date(download.downloadedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                      <Link to={`/papers/${download.paper._id}`} className="text-primary-600 hover:text-primary-900">
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <Download className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
                      <p className="text-sm text-gray-600 mb-4">Papers you download will appear here</p>
                      <Link to="/papers" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                        Browse Papers
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-6">

                      {/* Profile Picture Upload */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={profilePictureInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                  )}
                  <div className='flex flex-col gap-2'>
                    <button
                      type="button"
                      onClick={() => profilePictureInputRef.current.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Change Picture
                    </button>
                    {profilePictureFile && <p className="text-xs text-gray-500">New picture selected!</p>}
                  </div>
                </div>
              </div>


                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              name="username"
                              value={profileData.username}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              defaultValue={user?.email}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                            <input
                              type="text"
                              name="university"
                              value={profileData.university}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                              type="text"
                              name="department"
                              value={profileData.department}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <input
                              type="text"
                              name="semester"
                              value={profileData.semester}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <input
                              type="text"
                              name="batch"
                              value={profileData.batch}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            disabled={updateProfileMutation.isLoading}
                          >
                            {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={handleChangePassword}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Key className="h-4 w-4 mr-2" /> Change Password
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                          >
                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;