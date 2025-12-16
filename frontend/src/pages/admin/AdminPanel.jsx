import { Link } from 'react-router-dom';
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import {
  Shield,
  FileText,
  Edit,
  Users,
  BarChart3,
  Flag,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Trash2,
  Filter,
  UserCheck,
  User as UserIcon,
  Loader2,
  AlertTriangle
} from 'lucide-react';


const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [paperSearch, setPaperSearch] = useState('');
  const { token } = useAuth(); // Get the token from AuthContext

  const { data: stats } = useQuery(
    ['admin-stats', token],
    async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    { enabled: !!token } // Only fetch if token exists
  );

  const { data: pendingPapers, isLoading: isLoadingPending, isError: isErrorPending } = useQuery(
    ['pending-papers', activeTab, token], // Re-run query when activeTab or token changes
    async () => {
      const response = await api.get('/admin/papers/pending');
      return response.data;
    },
    { enabled: activeTab === 'pending' && !!token } // Only fetch when this tab is active and token exists
  );

  const { data: reportedPapers, isLoading: isLoadingReported, isError: isErrorReported } = useQuery(
    ['reported-papers', activeTab, token],
    async () => {
      const response = await api.get('/admin/papers/reported');
      return response.data;
    },
    {
      enabled: activeTab === 'reports' && !!token,
    }
  );

  const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery(
    ['all-users', activeTab, token],
    async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    {
      enabled: activeTab === 'users' && !!token,
    }
  );

  const { data: allPapersData, isLoading: isLoadingAllPapers, isError: isErrorAllPapers } = useQuery(
    ['all-papers', activeTab, token],
    async () => {
      const response = await api.get('/admin/papers/all');
      return response.data;
    },
    { enabled: activeTab === 'allPapers' && !!token }
  );

  const updatePaperStatus = useMutation(
    ({ paperId, status }) => api.patch(`/admin/papers/${paperId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pending-papers']);
        queryClient.invalidateQueries(['reported-papers']);
        queryClient.invalidateQueries(['admin-stats']);
        toast.success('Paper status updated!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update paper status.');
      },
    }
  );

  const updateUserRole = useMutation(
    ({ userId, role }) => api.patch(`/admin/users/${userId}/role`, { role }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('all-users');
        toast.success(`User role updated to ${data.data.role}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user role.');
      },
    }
  );

  const deletePaper = useMutation(
    (paperId) => api.delete(`/admin/papers/${paperId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pending-papers', 'reported-papers', 'admin-stats', 'all-papers']);
        toast.success('Paper deleted successfully!');
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete paper.'),
    }
  );

  const handleApprove = (paperId) => {
    if (window.confirm('Are you sure you want to keep this paper?')) {
      updatePaperStatus.mutate({ paperId, status: 'approved' });
    }
  };

  const handleReject = (paperId) => {
    if (window.confirm('Are you sure you want to remove this paper?')) {
      updatePaperStatus.mutate({ paperId, status: 'rejected' });
    }
  };

  const handleRoleChange = (userId, newRole) => {
    const action = newRole === 'admin' ? 'promote' : 'demote';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      updateUserRole.mutate({ userId, role: newRole });
    }
  };

  const handleDeletePaper = (paperId) => {
    if (window.confirm('Are you sure you want to permanently delete this paper? This action cannot be undone.')) {
      deletePaper.mutate(paperId);
    }
  };

  const filteredUsers = usersData?.users?.filter(user =>
    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPendingPapers = useMemo(() => 
    pendingPapers?.papers?.filter(paper =>
      paper.title.toLowerCase().includes(paperSearch.toLowerCase()) ||
      paper.uploader.username.toLowerCase().includes(paperSearch.toLowerCase())
    ), [pendingPapers, paperSearch]
  );
  
  const filteredAllPapers = useMemo(() =>
    allPapersData?.papers?.filter(paper =>
      paper.title.toLowerCase().includes(paperSearch.toLowerCase()) ||
      paper.uploader.username.toLowerCase().includes(paperSearch.toLowerCase())
    ), [allPapersData, paperSearch]
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'pending', name: 'Pending Review', icon: FileText },
    { id: 'reports', name: 'Reported Content', icon: Flag },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'allPapers', name: 'All Papers', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 p-6 rounded-lg bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5" style={{maskImage: 'linear-gradient(to bottom, transparent, black)'}}></div>
            <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                    <Shield className="h-8 w-8 text-primary-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                </div>
                <p className="text-gray-600">Manage papers, users, and platform content</p>
            </div>
        </div>

        {/* Stats */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Papers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FileText className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingPapers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
.
                <div className="p-3 bg-success-100 rounded-lg">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                      <p className="text-primary-100 mb-4">Manage pending papers and user reports</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab('pending')}
                          className="w-full text-left p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200"
                        >
                          Review Pending Papers ({stats?.pendingPapers})
                        </button>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="w-full text-left p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200"
                        >
                          Handle User Reports
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">New papers uploaded today</span>
                          <span className="font-semibold">{stats?.newPapersToday || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Papers approved today</span>
                          <span className="font-semibold">{stats?.approvedPapersToday || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">New user registrations</span>
                          <span className="font-semibold">{stats?.newUsersToday || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Papers Pending Review</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search by title or uploader..."
                        value={paperSearch}
                        onChange={(e) => setPaperSearch(e.target.value)}
                        className="input-field pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
                {isLoadingPending && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <span className="ml-3 text-gray-600">Loading pending papers...</span>
                    </div>
                )}
                {isErrorPending && (
                    <div className="text-center py-8 bg-error-50 text-error-700 rounded-lg">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error Loading Papers</h3>
                        <p>There was a problem fetching the papers pending review.</p>
                    </div>
                )}
                {filteredPendingPapers && filteredPendingPapers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPendingPapers.map((paper) => (
                      <div key={paper._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link to={`/papers/${paper._id}`} className="hover:underline text-primary-600">
                              <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-2">
                              {paper.course} • {paper.courseCode} • {paper.university}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Uploaded by {paper.uploader.username}</span>
                              <span>•</span>
                              <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleApprove(paper._id)}
                              className="btn-success text-sm px-3 py-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(paper._id)}
                              className="btn-secondary text-error-600 hover:text-error-700 text-sm px-3 py-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={() => alert('Edit functionality to be implemented.')}
                              className="btn-secondary text-sm px-3 py-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaper(paper._id)}
                              className="btn-secondary text-error-600 hover:text-error-700 text-sm px-3 py-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoadingPending && !isErrorPending && <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{paperSearch ? 'No papers found' : 'No papers pending review'}</h3>
                    <p className="text-gray-600">All papers have been reviewed and processed</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Reported Papers</h2>
                
                {isLoadingReported && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <span className="ml-3 text-gray-600">Loading reported papers...</span>
                    </div>
                )}
                {isErrorReported && (
                    <div className="text-center py-8 bg-error-50 text-error-700 rounded-lg">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error Loading Reports</h3>
                        <p>There was a problem fetching the reported papers.</p>
                    </div>
                )}
                {reportedPapers?.papers && reportedPapers.papers.length > 0 ? (
                  <div className="space-y-6">
                    {reportedPapers.papers.map((paper) => (
                      <div key={paper._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link to={`/papers/${paper._id}`} className="hover:underline text-primary-600">
                              <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
                            </Link>
                            <p className="text-gray-600 text-sm">
                              {paper.course} • {paper.courseCode} • {paper.university}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprove(paper._id)}
                              className="btn-success text-sm px-3 py-1"
                            >
                              Keep
                            </button>
                            <button
                              onClick={() => handleReject(paper._id)}
                              className="btn-secondary text-error-600 hover:text-error-700 text-sm px-3 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Reports</h4>
                          <div className="space-y-3">
                            {paper.reports.map((report, index) => (
                              <div key={index} className="border-l-4 border-error-400 pl-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900">
                                    {report.user?.username || 'Anonymous'}
                                  </span>
                                  <span className="text-sm text-gray-500 capitalize">
                                    {report.reason.replace('_', ' ')}
                                  </span>
                                </div>
                                {report.description && (
                                  <p className="text-gray-600 text-sm">{report.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoadingReported && !isErrorReported && <div className="text-center py-8">
                    <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reported papers</h3>
                    <p className="text-gray-600">All reports have been addressed</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="input-field pl-10 w-full"
                    />
                  </div>
                </div>

                {isLoadingUsers && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <span className="ml-3 text-gray-600">Loading users...</span>
                    </div>
                )}
                {isErrorUsers && (
                    <div className="text-center py-8 bg-error-50 text-error-700 rounded-lg">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error Loading Users</h3>
                        <p>There was a problem fetching the user list.</p>
                    </div>
                )}
                {filteredUsers && filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            University
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.university}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {user.role !== 'admin' ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                    className="btn-secondary text-sm px-3 py-1 flex items-center"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Promote
                                  </button>
                                </div>
                              ) : user.email !== 'admin@example.com' ? ( // Assuming a root admin you don't want to demote
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to demote this admin to a regular user?')) {
                                      handleRoleChange(user._id, 'user');
                                    }
                                  }}
                                  className="btn-secondary text-sm px-3 py-1 flex items-center text-warning-600 hover:text-warning-700">
                                  Demote
                                </button>
                              ) : (
                                <span className="text-gray-400">Admin</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !isLoadingUsers && !isErrorUsers && <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">Your search did not match any users.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'allPapers' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Papers</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search by title or uploader..."
                        value={paperSearch}
                        onChange={(e) => setPaperSearch(e.target.value)}
                        className="input-field pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
                {isLoadingAllPapers && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        <span className="ml-3 text-gray-600">Loading all papers...</span>
                    </div>
                )}
                {isErrorAllPapers && (
                    <div className="text-center py-8 bg-error-50 text-error-700 rounded-lg">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Error Loading Papers</h3>
                        <p>There was a problem fetching all papers.</p>
                    </div>
                )}
                {filteredAllPapers && filteredAllPapers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAllPapers.map((paper) => (
                      <div key={paper._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link to={`/papers/${paper._id}`} className="hover:underline text-primary-600">
                              <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-2">
                              {paper.course} • {paper.courseCode} • {paper.university}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Uploaded by {paper.uploader.username}</span>
                              <span>•</span>
                              <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => alert('Edit functionality to be implemented.')}
                              className="btn-secondary text-sm px-3 py-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaper(paper._id)}
                              className="btn-secondary text-error-600 hover:text-error-700 text-sm px-3 py-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoadingAllPapers && !isErrorAllPapers && <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{paperSearch ? 'No papers found' : 'No papers available'}</h3>
                    <p className="text-gray-600">There are no papers to display.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;