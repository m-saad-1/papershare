import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  FileText,
  Flag,
  LogOut,
  Search,
  Shield,
  StickyNote,
  Trash2,
  UserCheck,
  User as UserIcon,
  Users,
  X,
  XCircle,
} from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'pending', name: 'Pending Approvals', icon: AlertTriangle },
  { id: 'approved', name: 'Approved Content', icon: CheckCircle },
  { id: 'reports', name: 'Reports', icon: Flag },
  { id: 'users', name: 'Users', icon: Users },
];

const AdminPanel = () => {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [contentSearch, setContentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('pending');
  const [selectedVerificationPaper, setSelectedVerificationPaper] = useState(null);

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    ['admin-stats', token],
    async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    { enabled: !!token }
  );

  const { data: pendingPapersData, isLoading: isLoadingPendingPapers } = useQuery(
    ['admin-pending-papers', token],
    async () => {
      const response = await api.get('/admin/papers/pending?limit=50');
      return response.data;
    },
    { enabled: activeTab === 'pending' && !!token }
  );

  const { data: pendingNotesData, isLoading: isLoadingPendingNotes } = useQuery(
    ['admin-pending-notes', token],
    async () => {
      const response = await api.get('/admin/notes/pending?limit=50');
      return response.data;
    },
    { enabled: activeTab === 'pending' && !!token }
  );

  const { data: approvedPapersData, isLoading: isLoadingApprovedPapers } = useQuery(
    ['admin-approved-papers', token],
    async () => {
      const response = await api.get('/admin/papers/all?status=approved&limit=50');
      return response.data;
    },
    { enabled: activeTab === 'approved' && !!token }
  );

  const { data: approvedNotesData, isLoading: isLoadingApprovedNotes } = useQuery(
    ['admin-approved-notes', token],
    async () => {
      const response = await api.get('/admin/notes/all?status=approved&limit=50');
      return response.data;
    },
    { enabled: activeTab === 'approved' && !!token }
  );

  const { data: reportsData, isLoading: isLoadingReports } = useQuery(
    ['admin-reports', reportStatus, token],
    async () => {
      const response = await api.get(`/reports/moderation-queue?status=${reportStatus}`);
      return response.data;
    },
    { enabled: activeTab === 'reports' && !!token }
  );

  const { data: usersData, isLoading: isLoadingUsers } = useQuery(
    ['admin-users', token],
    async () => {
      const response = await api.get('/admin/users?limit=100');
      return response.data;
    },
    { enabled: activeTab === 'users' && !!token }
  );

  const reviewPaperMutation = useMutation(
    ({ paperId, status }) => api.patch(`/admin/papers/${paperId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-pending-papers']);
        queryClient.invalidateQueries(['admin-approved-papers']);
        queryClient.invalidateQueries(['admin-stats']);
        queryClient.invalidateQueries(['paper-requests']);
        queryClient.invalidateQueries('paper-requests');
        setSelectedVerificationPaper(null);
        toast.success('Paper status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update paper status');
      },
    }
  );

  const reviewNoteMutation = useMutation(
    ({ noteId, status }) => api.patch(`/admin/notes/${noteId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-pending-notes']);
        queryClient.invalidateQueries(['admin-approved-notes']);
        queryClient.invalidateQueries(['admin-stats']);
        toast.success('Note status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update note status');
      },
    }
  );

  const reviewReportMutation = useMutation(
    ({ reportId, reviewData }) => api.patch(`/reports/${reportId}/review`, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-reports']);
        toast.success('Report reviewed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to review report');
      },
    }
  );

  const updateUserRoleMutation = useMutation(
    ({ userId, role }) => api.patch(`/admin/users/${userId}/role`, { role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User role updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user role');
      },
    }
  );

  const filteredPendingPapers = useMemo(() => (
    (pendingPapersData?.papers || []).filter((paper) =>
      [paper.title, paper.course, paper.uploader?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(contentSearch.toLowerCase()))
    )
  ), [pendingPapersData, contentSearch]);

  const filteredPendingNotes = useMemo(() => (
    (pendingNotesData?.notes || []).filter((note) =>
      [note.title, note.course, note.uploader?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(contentSearch.toLowerCase()))
    )
  ), [pendingNotesData, contentSearch]);

  const filteredApprovedPapers = useMemo(() => (
    (approvedPapersData?.papers || []).filter((paper) =>
      [paper.title, paper.course, paper.uploader?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(contentSearch.toLowerCase()))
    )
  ), [approvedPapersData, contentSearch]);

  const filteredApprovedNotes = useMemo(() => (
    (approvedNotesData?.notes || []).filter((note) =>
      [note.title, note.course, note.uploader?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(contentSearch.toLowerCase()))
    )
  ), [approvedNotesData, contentSearch]);

  const filteredUsers = useMemo(() => (
    (usersData?.users || []).filter((user) =>
      [user.username, user.email, user.university]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(userSearch.toLowerCase()))
    )
  ), [usersData, userSearch]);

  const handleReportReview = (reportId, status, action, adminNotes = '') => {
    reviewReportMutation.mutate({ reportId, reviewData: { status, action, adminNotes } });
  };

  const renderContentCard = (item, type, actions = null) => (
    <div key={item._id} className="card-interactive p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link to={type === 'paper' ? `/papers/${item._id}` : `/notes/${item._id}`} className="text-primary-600 hover:underline">
            <h3 className="text-fluid-base font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
          </Link>
          <p className="text-fluid-sm text-gray-600 mt-1 line-clamp-1">
            {item.course} {item.courseCode ? `• ${item.courseCode}` : ''} • {item.university}
          </p>
          <div className="mt-2 text-fluid-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span>Uploader: {item.uploader?.username || 'Unknown'}</span>
            <span>Status: {item.status}</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>

          {type === 'paper' && item.linkedRequest?.isLinked && item.linkedRequest?.request && (
            <div className="mt-3 rounded-md border border-primary-200 bg-primary-50 p-3">
              <p className="text-fluid-sm font-semibold uppercase tracking-wide text-primary-700">Linked Requested Paper</p>
              <p className="mt-1 text-fluid-sm font-semibold text-primary-900">
                {item.linkedRequest.request.title?.trim() || `${item.linkedRequest.request.courseName} (${String(item.linkedRequest.request.examType || '').toUpperCase()} ${item.linkedRequest.request.year})`}
              </p>
              <p className="text-fluid-sm text-primary-800 mt-1">
                Course: {item.linkedRequest.request.courseName} • {item.linkedRequest.request.university} • {item.linkedRequest.request.department}
              </p>
              <p className="text-fluid-sm text-primary-800 mt-1">
                Requested by: {item.linkedRequest.request.requester?.username || 'Unknown'} • Request status: {item.linkedRequest.request.status}
              </p>
              <button
                type="button"
                className="mt-3 text-fluid-sm font-medium text-primary-700 hover:text-primary-800 hover:underline min-h-touch"
                onClick={() => setSelectedVerificationPaper(item)}
              >
                View requested paper details
              </button>
            </div>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 sm:flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-100 p-3">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-fluid-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-fluid-base text-gray-600 mt-1">Moderate pending content, review reports, and manage users from one place.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary min-h-touch"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="card p-2 sm:p-4">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar -mx-2 px-2 lg:mx-0 lg:px-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2.5 text-fluid-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-touch lg:w-full ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  {isLoadingStats ? (
                    [...Array(4)].map((_, index) => <div key={index} className="card h-24 sm:h-28 skeleton" />)
                  ) : (
                    [
                      { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: AlertTriangle, tone: 'bg-warning-100 text-warning-700' },
                      { label: 'Approved Content', value: stats?.approvedContent || 0, icon: CheckCircle, tone: 'bg-success-100 text-success-700' },
                      { label: 'Open Reports', value: stats?.totalReports || 0, icon: Flag, tone: 'bg-error-100 text-error-700' },
                      { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, tone: 'bg-primary-100 text-primary-700' },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="card p-4 sm:p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-fluid-sm font-medium text-gray-600">{card.label}</p>
                              <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`rounded-xl p-2 sm:p-3 ${card.tone}`}>
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div className="card p-4 sm:p-6">
                    <h2 className="text-fluid-base font-semibold text-gray-900 mb-4">Content Snapshot</h2>
                    <div className="space-y-3 text-fluid-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-600">Total Papers</span><span className="font-semibold text-gray-900">{stats?.totalPapers || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Total Notes</span><span className="font-semibold text-gray-900">{stats?.totalNotes || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Pending Papers</span><span className="font-semibold text-gray-900">{stats?.pendingPapers || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Pending Notes</span><span className="font-semibold text-gray-900">{stats?.pendingNotes || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Total Downloads</span><span className="font-semibold text-gray-900">{stats?.totalDownloads || 0}</span></div>
                    </div>
                  </div>

                  <div className="card p-4 sm:p-6">
                    <h2 className="text-fluid-base font-semibold text-gray-900 mb-4">Today</h2>
                    <div className="space-y-3 text-fluid-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-600">New Papers</span><span className="font-semibold text-gray-900">{stats?.newPapersToday || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">New Notes</span><span className="font-semibold text-gray-900">{stats?.newNotesToday || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Approved Papers</span><span className="font-semibold text-gray-900">{stats?.approvedPapersToday || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Approved Notes</span><span className="font-semibold text-gray-900">{stats?.approvedNotesToday || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">New Users</span><span className="font-semibold text-gray-900">{stats?.newUsersToday || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-fluid-base font-semibold text-gray-900">Pending Approvals</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-10 w-full sm:w-72 min-h-touch"
                      placeholder="Search pending content"
                      value={contentSearch}
                      onChange={(event) => setContentSearch(event.target.value)}
                    />
                  </div>
                </div>

                {(isLoadingPendingPapers || isLoadingPendingNotes) ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton h-32 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-primary-600" /><h3 className="text-fluid-base font-semibold text-gray-900">Pending Papers</h3></div>
                      <div className="space-y-3 sm:space-y-4">
                        {filteredPendingPapers.length > 0 ? filteredPendingPapers.map((paper) => renderContentCard(
                          paper,
                          'paper',
                          <>
                            <button type="button" onClick={() => reviewPaperMutation.mutate({ paperId: paper._id, status: 'approved' })} className="btn-success text-fluid-sm px-3 py-2 min-h-touch"><CheckCircle className="h-4 w-4 mr-1" />Approve</button>
                            <button type="button" onClick={() => reviewPaperMutation.mutate({ paperId: paper._id, status: 'rejected' })} className="btn-secondary text-error-600 hover:text-error-700 text-fluid-sm px-3 py-2 min-h-touch"><XCircle className="h-4 w-4 mr-1" />Reject</button>
                          </>
                        )) : <p className="text-fluid-sm text-gray-600">No pending papers.</p>}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-4"><StickyNote className="h-5 w-5 text-emerald-600" /><h3 className="text-fluid-base font-semibold text-gray-900">Pending Notes</h3></div>
                      <div className="space-y-3 sm:space-y-4">
                        {filteredPendingNotes.length > 0 ? filteredPendingNotes.map((note) => renderContentCard(
                          note,
                          'note',
                          <>
                            <button type="button" onClick={() => reviewNoteMutation.mutate({ noteId: note._id, status: 'approved' })} className="btn-success text-fluid-sm px-3 py-2 min-h-touch"><CheckCircle className="h-4 w-4 mr-1" />Approve</button>
                            <button type="button" onClick={() => reviewNoteMutation.mutate({ noteId: note._id, status: 'rejected' })} className="btn-secondary text-error-600 hover:text-error-700 text-fluid-sm px-3 py-2 min-h-touch"><XCircle className="h-4 w-4 mr-1" />Reject</button>
                          </>
                        )) : <p className="text-fluid-sm text-gray-600">No pending notes.</p>}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-fluid-base font-semibold text-gray-900">Approved Content</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-10 w-full sm:w-72 min-h-touch"
                      placeholder="Search approved content"
                      value={contentSearch}
                      onChange={(event) => setContentSearch(event.target.value)}
                    />
                  </div>
                </div>

                {(isLoadingApprovedPapers || isLoadingApprovedNotes) ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton h-32 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-primary-600" /><h3 className="text-fluid-base font-semibold text-gray-900">Approved Papers</h3></div>
                      <div className="space-y-3 sm:space-y-4">
                        {filteredApprovedPapers.length > 0 ? filteredApprovedPapers.map((paper) => renderContentCard(paper, 'paper')) : <p className="text-fluid-sm text-gray-600">No approved papers found.</p>}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-4"><StickyNote className="h-5 w-5 text-emerald-600" /><h3 className="text-fluid-base font-semibold text-gray-900">Approved Notes</h3></div>
                      <div className="space-y-3 sm:space-y-4">
                        {filteredApprovedNotes.length > 0 ? filteredApprovedNotes.map((note) => renderContentCard(note, 'note')) : <p className="text-fluid-sm text-gray-600">No approved notes found.</p>}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-fluid-base font-semibold text-gray-900">Reports</h2>
                  <div className="flex flex-wrap gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
                    {['pending', 'reviewing', 'resolved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setReportStatus(status)}
                        className={`px-3 py-2 rounded-lg text-fluid-sm font-medium min-h-touch whitespace-nowrap ${reportStatus === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingReports ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton h-40 rounded-lg" />
                    ))}
                  </div>
                ) : (reportsData?.reports || []).length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-fluid-base text-gray-600">No reports with status {reportStatus}.</div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {(reportsData?.reports || []).map((report) => {
                      const content = report.paper || report.note;
                      const contentType = report.paper ? 'paper' : 'note';
                      return (
                        <div key={report._id} className="card-interactive p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-fluid-base font-semibold text-gray-900">{content?.title || `${contentType} deleted`}</h3>
                              <p className="text-fluid-sm text-gray-600 mt-1">{content?.course} • {content?.university}</p>
                              <div className="mt-3 space-y-2 text-fluid-sm text-gray-700">
                                <p><span className="font-medium text-gray-900">Reported by:</span> {report.reporter?.username} ({report.reporter?.email})</p>
                                <p><span className="font-medium text-gray-900">Reason:</span> {report.reason.replace(/_/g, ' ')}</p>
                                <p><span className="font-medium text-gray-900">Description:</span> {report.description}</p>
                                {report.adminNotes && <p><span className="font-medium text-gray-900">Admin notes:</span> {report.adminNotes}</p>}
                              </div>
                            </div>
                            <span className="text-fluid-sm font-semibold rounded-full px-2.5 py-1 bg-gray-100 text-gray-700 whitespace-nowrap self-start">{report.status}</span>
                          </div>

                          {report.status === 'pending' && content && (
                            <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                              <button type="button" onClick={() => {
                                const notes = window.prompt('Admin notes (optional):', '') || '';
                                handleReportReview(report._id, 'resolved', 'none', notes);
                              }} className="btn-success text-fluid-sm px-4 py-2 min-h-touch"><CheckCircle className="h-4 w-4 mr-1" />Dismiss Report</button>
                              <button type="button" onClick={() => {
                                if (!window.confirm(`Remove this ${contentType}?`)) return;
                                const notes = window.prompt('Reason for removal:', '') || `${contentType} removed after moderation`;
                                handleReportReview(report._id, 'resolved', contentType === 'paper' ? 'paper_removed' : 'note_removed', notes);
                              }} className="btn-secondary text-error-600 hover:text-error-700 text-fluid-sm px-4 py-2 min-h-touch"><Trash2 className="h-4 w-4 mr-1" />Remove {contentType === 'paper' ? 'Paper' : 'Note'}</button>
                              <Link to={contentType === 'paper' ? `/papers/${content._id}` : `/notes/${content._id}`} className="btn-secondary text-fluid-sm px-4 py-2 min-h-touch">Open {contentType === 'paper' ? 'Paper' : 'Note'}</Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-fluid-base font-semibold text-gray-900">Users</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-10 w-full sm:w-72 min-h-touch"
                      placeholder="Search users"
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                    />
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="skeleton h-20 rounded-lg" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-fluid-base text-gray-600">No users found.</div>
                ) : (
                  <>
                    {/* Mobile: Card Layout */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {filteredUsers.map((user) => (
                        <div key={user._id} className="card-interactive p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-fluid-base font-semibold text-gray-900 truncate">{user.username}</p>
                              <p className="text-fluid-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                            <div className="flex flex-col gap-1">
                              <p className="text-fluid-sm text-gray-600">{user.university || 'N/A'}</p>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-fluid-sm font-semibold w-fit ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                                {user.role}
                              </span>
                            </div>
                            {user.role === 'admin' ? (
                              <button type="button" onClick={() => updateUserRoleMutation.mutate({ userId: user._id, role: 'user' })} className="btn-secondary text-fluid-sm px-3 py-2 min-h-touch">Demote</button>
                            ) : (
                              <button type="button" onClick={() => updateUserRoleMutation.mutate({ userId: user._id, role: 'admin' })} className="btn-secondary text-fluid-sm px-3 py-2 min-h-touch"><UserCheck className="h-4 w-4 mr-1" />Promote</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-fluid-sm font-semibold text-gray-500 uppercase tracking-wide">User</th>
                            <th className="px-4 py-3 text-left text-fluid-sm font-semibold text-gray-500 uppercase tracking-wide">University</th>
                            <th className="px-4 py-3 text-left text-fluid-sm font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                            <th className="px-4 py-3 text-right text-fluid-sm font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredUsers.map((user) => (
                            <tr key={user._id}>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"><UserIcon className="h-5 w-5" /></div>
                                  <div>
                                    <p className="text-fluid-sm font-semibold text-gray-900">{user.username}</p>
                                    <p className="text-fluid-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-fluid-sm text-gray-600">{user.university || 'N/A'}</td>
                              <td className="px-4 py-4 text-fluid-sm text-gray-600">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-fluid-sm font-semibold ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                {user.role === 'admin' ? (
                                  <button type="button" onClick={() => updateUserRoleMutation.mutate({ userId: user._id, role: 'user' })} className="btn-secondary text-fluid-sm px-3 py-2 min-h-touch">Demote</button>
                                ) : (
                                  <button type="button" onClick={() => updateUserRoleMutation.mutate({ userId: user._id, role: 'admin' })} className="btn-secondary text-fluid-sm px-3 py-2 min-h-touch"><UserCheck className="h-4 w-4 mr-1" />Promote</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedVerificationPaper?.linkedRequest?.request && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedVerificationPaper(null)}
        >
          <div
            className="modal-content max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-handle" />
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 sm:p-5">
              <div>
                <h3 className="text-fluid-base font-bold text-gray-900">Linked Request Verification</h3>
                <p className="mt-1 text-fluid-sm text-gray-600">
                  Compare the uploaded paper with the original requested-paper record before moderation.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 min-h-touch min-w-[44px] flex items-center justify-center"
                onClick={() => setSelectedVerificationPaper(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-5 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-fluid-sm font-semibold uppercase tracking-wide text-slate-500">Uploaded Paper</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 text-fluid-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-slate-500">Title</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.title}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Course</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.course}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Course Code</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.courseCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Paper Type</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedVerificationPaper.paperType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Year</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.year}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Semester</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.semester}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Teacher</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.teacher || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">University</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.university}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Uploader</p>
                    <p className="font-semibold text-slate-900">{selectedVerificationPaper.uploader?.username || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Submitted On</p>
                    <p className="font-semibold text-slate-900">{new Date(selectedVerificationPaper.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Moderation Status</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedVerificationPaper.status}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500">Description</p>
                    <p className="mt-1 whitespace-pre-wrap font-medium text-slate-900">
                      {selectedVerificationPaper.description?.trim() || 'No description was provided.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-primary-200 bg-primary-50 p-4">
                <p className="text-fluid-sm font-semibold uppercase tracking-wide text-primary-700">Original Requested Paper</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 text-fluid-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-primary-700">Title</p>
                    <p className="font-semibold text-primary-950">
                      {selectedVerificationPaper.linkedRequest.request.title?.trim() || 'Requested Paper Details'}
                    </p>
                  </div>
                  <div>
                    <p className="text-primary-700">Course</p>
                    <p className="font-semibold text-primary-950">{selectedVerificationPaper.linkedRequest.request.courseName}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Exam Type</p>
                    <p className="font-semibold text-primary-950 capitalize">{selectedVerificationPaper.linkedRequest.request.examType}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Year</p>
                    <p className="font-semibold text-primary-950">{selectedVerificationPaper.linkedRequest.request.year}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Status</p>
                    <p className="font-semibold text-primary-950 capitalize">{selectedVerificationPaper.linkedRequest.request.status}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">University</p>
                    <p className="font-semibold text-primary-950">{selectedVerificationPaper.linkedRequest.request.university}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Department</p>
                    <p className="font-semibold text-primary-950">{selectedVerificationPaper.linkedRequest.request.department}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Requester</p>
                    <p className="font-semibold text-primary-950">{selectedVerificationPaper.linkedRequest.request.requester?.username || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-primary-700">Requested On</p>
                    <p className="font-semibold text-primary-950">{new Date(selectedVerificationPaper.linkedRequest.request.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-primary-700">Description</p>
                    <p className="mt-1 whitespace-pre-wrap font-medium text-primary-950">
                      {selectedVerificationPaper.linkedRequest.request.description?.trim() || 'No additional description was provided.'}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-fluid-sm text-gray-600">
                Approving this paper will fulfill the linked request and update request boards and dashboards.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {selectedVerificationPaper.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => reviewPaperMutation.mutate({ paperId: selectedVerificationPaper._id, status: 'rejected' })}
                      className="btn-secondary text-error-600 hover:text-error-700 text-fluid-sm px-3 py-2 min-h-touch"
                    >
                      <XCircle className="h-4 w-4 mr-1" />Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewPaperMutation.mutate({ paperId: selectedVerificationPaper._id, status: 'approved' })}
                      className="btn-success text-fluid-sm px-3 py-2 min-h-touch"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />Approve
                    </button>
                  </>
                )}
                <button type="button" className="btn-secondary min-h-touch" onClick={() => setSelectedVerificationPaper(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
