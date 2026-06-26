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
  Bell,
  Globe,
  BookOpen,
  Users,
  Award,
} from 'lucide-react';
import { Crown, TrendingUp } from 'lucide-react';
import { ThumbsUp } from 'lucide-react';
import { StyledBadge } from '@/components/badges/StyledBadge';

const STATUS_LEVELS = [
  { key: 'Student', label: 'Student', minReputation: 0, minUploads: 0 },
  { key: 'Contributor', label: 'Contributor', minReputation: 50, minUploads: 1 },
  { key: 'Verified Contributor', label: 'Verified Contributor', minReputation: 200, minUploads: 10 },
  { key: 'Top Scholar', label: 'Top Scholar', minReputation: 600, minUploads: 30 },
  { key: 'Campus Ambassador', label: 'Campus Ambassador', minReputation: 1200, minUploads: 60 },
];

const BADGE_PROGRESS_TARGETS = [
  { key: 'first_upload', label: 'First Upload', metricKey: 'totalUploads', threshold: 1 },
  { key: 'contributor', label: 'Contributor', metricKey: 'totalUploads', threshold: 10 },
  { key: 'department_hero', label: 'Department Hero', metricKey: 'totalUploads', threshold: 50 },
  { key: 'study_guide', label: 'Study Guide', metricKey: 'noteUploads', threshold: 3 },
  { key: 'exam_saver', label: 'Exam Saver', metricKey: 'downloadsGenerated', threshold: 50 },
  { key: 'knowledge_king', label: 'Knowledge King', metricKey: 'helpfulVotesReceived', threshold: 20 },
];

const DASHBOARD_TABS = [
  'overview',
  'my-papers',
  'notes',
  'requests',
  // 'certificates',
  'downloads',
  'settings',
];

const Dashboard = () => {
  const { user, logout, token, isAdmin, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState(null);
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
  const infoModalRef = React.useRef(null);

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

  useEffect(() => {
    if (!DASHBOARD_TABS.includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab]);

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

  const { data: userNotes, isLoading: isLoadingNotes } = useQuery(
    'user-notes',
    async () => {
      const response = await apiClient.get('/notes/user/my-notes');
      return response.data;
    },
    {
      enabled: !!token && !isAdmin && (activeTab === 'notes' || activeTab === 'overview'),
    }
  );

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery('leaderboard-widget', async () => {
    const response = await apiClient.get('/users/leaderboard?limit=5');
    return response.data?.users || [];
  }, {
    enabled: activeTab === 'overview',
  });

  const { data: impactMetrics } = useQuery(['impact-metrics', user?._id], async () => {
    const response = await apiClient.get(`/users/${user._id}/impact`);
    return response.data;
  }, {
    enabled: !!user?._id && activeTab === 'overview',
  });

  const { data: notificationsData } = useQuery(['dashboard-notifications', user?._id], async () => {
    const response = await apiClient.get(`/users/${user._id}/notifications`);
    return response.data?.notifications || [];
  }, {
    enabled: !!user?._id && activeTab === 'overview',
  });

  // Requests and Certificates queries
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 1 && month <= 5) {
      return { semester: 'Spring', year };
    } else if (month >= 8 && month <= 12) {
      return { semester: 'Fall', year };
    }
    return { semester: 'Summer', year };
  });
  const [requestFormData, setRequestFormData] = useState({
    title: '',
    description: '',
    university: '',
    department: '',
    courseName: '',
    courseCode: '',
    teacher: '',
    semester: '',
    examType: 'final',
    year: new Date().getFullYear(),
    tags: '',
  });

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery(
    ['paper-requests', 'all'],
    async () => {
      const response = await apiClient.get('/requests?status=all&limit=100');
      return response.data;
    },
    {
      enabled: activeTab === 'requests',
      refetchInterval: activeTab === 'requests' ? 20000 : false,
      refetchIntervalInBackground: true,
    }
  );

  const { data: myCerts, isLoading: myCertsLoading } = useQuery({
    queryKey: ['my-certificates', user?._id],
    queryFn: async () => {
      const response = await apiClient.get('/certificates/my-certificates');
      return response.data;
    },
    enabled: !!user && activeTab === 'certificates',
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['certificates-leaderboard', selectedSemester],
    queryFn: async () => {
      const response = await apiClient.get(
        `/certificates/leaderboard/${selectedSemester.semester}/${selectedSemester.year}`
      );
      return response.data;
    },
    enabled: activeTab === 'certificates',
  });

  const createRequestMutation = useMutation(
    () => apiClient.post('/requests', requestFormData),
    {
      onSuccess: () => {
        toast.success('Paper request posted');
        setRequestFormData({
          title: '',
          description: '',
          university: '',
          department: '',
          courseName: '',
          courseCode: '',
          teacher: '',
          semester: '',
          examType: 'final',
          year: new Date().getFullYear(),
          tags: '',
        });
        setIsRequestFormOpen(false);
        queryClient.invalidateQueries('paper-requests');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create request');
      },
    }
  );

  const contributionMetrics = {
    totalUploads: Number(impactMetrics?.totalUploads || 0),
    paperUploads: Number(impactMetrics?.paperUploads || 0),
    noteUploads: Number(impactMetrics?.noteUploads || 0),
    downloadsGenerated: Number(impactMetrics?.downloadsGenerated || 0),
    helpfulVotesReceived: Number(impactMetrics?.helpfulVotesReceived || 0),
    totalViews: Number(impactMetrics?.totalViews || 0),
    paperViews: Number(impactMetrics?.paperViews || 0),
    noteViews: Number(impactMetrics?.noteViews || 0),
    points: Number(impactMetrics?.points ?? user?.reputation ?? 0),
  };

  const stats = {
    totalPapers: contributionMetrics.paperUploads,
    totalUploads: contributionMetrics.totalUploads,
    totalNotes: contributionMetrics.noteUploads,
    totalDownloads: contributionMetrics.downloadsGenerated,
    totalVotes: contributionMetrics.helpfulVotesReceived,
    totalViews: contributionMetrics.totalViews,
    totalPoints: contributionMetrics.points,
  };

  const recentPapers = isAdmin ? (papers?.papers || []) : (papers || []);
  const recentNotes = isAdmin ? [] : (userNotes || []);
  const myRequests = (requestsData?.requests || []).filter(
    (req) => req.requester?._id === user?._id
  );
  const topContributors = (leaderboardData || [])
    .map((contributor) => ({
      ...contributor,
      points: Number(contributor.points ?? contributor.reputation ?? 0),
      uploadCount: Number(contributor.uploadCount ?? contributor.totalUploads ?? 0),
    }))
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points;
      if (right.uploadCount !== left.uploadCount) return right.uploadCount - left.uploadCount;
      return String(left.username || '').localeCompare(String(right.username || ''));
    })
    .map((contributor, index) => ({
      ...contributor,
      rank: index + 1,
    }));
  const recentActivities = [...recentPapers.map((paper) => ({ ...paper, contentType: 'paper' })), ...recentNotes.map((note) => ({ ...note, contentType: 'note' }))]
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  const getRecentActivitySummary = (item) => {
    const createdAt = new Date(item.createdAt || 0).getTime();
    const updatedAt = new Date(item.updatedAt || item.createdAt || 0).getTime();
    const isStatusUpdate = updatedAt - createdAt > 1000 && ['approved', 'rejected'].includes(item.status);

    if (isStatusUpdate) {
      return `${item.contentType === 'note' ? 'Note' : 'Paper'} ${getStatusText(item.status)}`;
    }

    return `${item.contentType === 'note' ? 'Note' : 'Paper'} uploaded`;
  };

  const formatActivityDate = (item) => {
    const timestamp = item.updatedAt || item.createdAt;
    if (!timestamp) return 'Just now';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const currentStatusIndex = Math.max(
    0,
    STATUS_LEVELS.findIndex((level) => level.key === (user?.contributorStatus || 'Student'))
  );
  const nextStatus = STATUS_LEVELS[currentStatusIndex + 1] || null;

  const statusReputationStart = STATUS_LEVELS[currentStatusIndex]?.minReputation || 0;
  const statusReputationEnd = nextStatus?.minReputation || contributionMetrics.points;
  const statusReputationDenominator = Math.max(1, statusReputationEnd - statusReputationStart);
  const statusReputationProgress = nextStatus
    ? Math.min(100, Math.round(((contributionMetrics.points - statusReputationStart) / statusReputationDenominator) * 100))
    : 100;

  const nextBadgeTarget = BADGE_PROGRESS_TARGETS
    .filter((target) => !(user?.badgeKeys || []).includes(target.key))
    .map((target) => {
      const currentValue = Number(contributionMetrics[target.metricKey] || 0);
      return {
        ...target,
        currentValue,
        remaining: Math.max(0, target.threshold - currentValue),
      };
    })
    .sort((a, b) => a.remaining - b.remaining)[0] || null;

  const nextBadgeProgress = nextBadgeTarget
    ? Math.min(100, Math.round((nextBadgeTarget.currentValue / nextBadgeTarget.threshold) * 100))
    : 100;

  const badgeProgressRows = BADGE_PROGRESS_TARGETS.map((target) => {
    const currentValue = Number(contributionMetrics[target.metricKey] || 0);
    const progress = Math.min(100, Math.round((currentValue / target.threshold) * 100));
    const unlocked = (user?.badgeKeys || []).includes(target.key);

    return {
      ...target,
      currentValue,
      progress,
      unlocked,
    };
  });

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

  useEffect(() => {
    if (!infoModalType) return;

    const handleOutsideClick = (event) => {
      if (infoModalRef.current && !infoModalRef.current.contains(event.target)) {
        setInfoModalType(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setInfoModalType(null);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [infoModalType]);

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
      case 'notes': return <BookOpen className="h-4 w-4" />;
      case 'requests': return <FileText className="h-4 w-4" />;
      case 'certificates': return <Award className="h-4 w-4" />;
      case 'downloads': return <Download className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'overview': return 'Overview';
      case 'my-papers': return isAdmin ? 'All Papers' : 'My Papers';
      case 'notes': return 'Notes';
      case 'requests': return 'Requests';
      case 'certificates': return 'Certificates';
      case 'downloads': return 'Downloads';
      case 'settings': return 'Settings';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  return (
    <>
      {infoModalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div ref={infoModalRef} className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[85vh]">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-fluid-xl font-semibold text-gray-900">
                {infoModalType === 'badges' ? 'Badge System' : infoModalType === 'points' ? 'Points System' : 'Status System'}
              </h3>
              <button onClick={() => setInfoModalType(null)} className="text-gray-400 hover:text-gray-600 min-h-touch min-w-[44px] flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>

            {infoModalType === 'badges' && (
              <div className="space-y-3 text-fluid-sm text-gray-900 leading-relaxed">
                <p className="text-gray-700">Badges are earned through uploads and community impact across both papers and notes.</p>
                <ul className="space-y-2 text-gray-700">
                  <li><span className="font-semibold text-gray-900">First Upload:</span> Upload 1 item</li>
                  <li><span className="font-semibold text-gray-900">Contributor:</span> Upload 10 items</li>
                  <li><span className="font-semibold text-gray-900">Department Hero:</span> Upload 50 items</li>
                  <li><span className="font-semibold text-gray-900">Study Guide:</span> Upload 3 notes</li>
                  <li><span className="font-semibold text-gray-900">Exam Saver:</span> Generate 50 downloads</li>
                  <li><span className="font-semibold text-gray-900">Knowledge King:</span> Receive 20 helpful votes</li>
                </ul>
                <div className="pt-2 border-t border-gray-200 space-y-3">
                  <p className="text-fluid-xs font-semibold tracking-wide text-gray-600 uppercase">Your Badge Progress</p>
                  {badgeProgressRows.map((badge) => (
                    <div key={badge.key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-900">{badge.label}</p>
                        <span className={`text-fluid-xs font-semibold px-2 py-1 rounded-full ${badge.unlocked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {badge.unlocked ? 'Unlocked' : `${badge.currentValue} / ${badge.threshold}`}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${badge.unlocked ? 'bg-green-500' : 'bg-primary-600'}`} style={{ width: `${badge.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoModalType === 'points' && (
              <div className="space-y-3 text-fluid-sm text-gray-900 leading-relaxed">
                <p className="font-bold text-gray-900">Points increase when your contributions help others.</p>
                <ul className="space-y-2 text-gray-900 font-bold">
                  <li>Upload content: +20 points</li>
                  <li>Download generated from your content: +2 points</li>
                  <li>Helpful vote received: +5 points</li>
                  <li>Weekly top contributor bonus: +50 points</li>
                </ul>
              </div>
            )}

            {infoModalType === 'status' && (
              <div className="space-y-3 text-fluid-sm text-gray-900 leading-relaxed">
                <p className="text-gray-700">Status level requires both reputation and uploads.</p>
                <ul className="space-y-2 text-gray-700">
                  <li><span className="font-semibold text-gray-900">Contributor:</span> 50 points and 1 upload</li>
                  <li><span className="font-semibold text-gray-900">Verified Contributor:</span> 200 points and 10 uploads</li>
                  <li><span className="font-semibold text-gray-900">Top Scholar:</span> 600 points and 30 uploads</li>
                  <li><span className="font-semibold text-gray-900">Campus Ambassador:</span> 1200 points and 60 uploads</li>
                </ul>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div ref={modalRef} className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Key className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-fluid-xl font-semibold text-gray-900">Change Password</h3>
              </div>
              <button onClick={() => setIsChangePasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600 min-h-touch min-w-[44px] flex items-center justify-center">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-fluid-sm text-error-700 flex items-center">
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
                  <label className="block text-fluid-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                      placeholder="Enter current password"
                      value={passwordFields.currentPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, currentPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 min-h-touch min-w-[44px] flex items-center justify-center">
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-fluid-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                      placeholder="Enter new password"
                      value={passwordFields.newPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, newPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 min-h-touch min-w-[44px] flex items-center justify-center">
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-fluid-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                      placeholder="Confirm new password"
                      value={passwordFields.confirmNewPassword}
                      onChange={(e) => setPasswordFields({...passwordFields, confirmNewPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 min-h-touch min-w-[44px] flex items-center justify-center">
                      {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 min-h-touch"
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
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <h1 className="text-fluid-lg font-bold text-gray-900">Dashboard</h1>
            </div>
            {/* Mobile Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to="/upload"
                className="flex items-center justify-center px-3 py-2 text-fluid-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-touch"
                title="Upload Paper"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Upload</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg hidden min-h-touch" // Hidden as per request
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto border-t border-gray-200 bg-white hide-scrollbar scroll-snap-x">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 min-w-[60px] sm:min-w-[80px] min-h-touch flex flex-col items-center justify-center py-2 px-1 text-fluid-xs font-medium transition-colors scroll-snap-item ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="h-5 w-5 sm:h-4 sm:w-4 flex items-center justify-center">
                  {getTabIcon(tab)}
                </div>
                <span className={`mt-0.5 whitespace-nowrap text-[11px] sm:text-fluid-xs ${activeTab === tab ? 'inline' : 'hidden'} sm:inline`}>
                  {getTabLabel(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:px-8 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6 lg:mb-8">
            <h1 className="text-fluid-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-fluid-base text-gray-600 mt-1 lg:mt-2">Welcome back, {user?.username}!</p>
          </div>

          <div className={`${activeTab === 'overview' ? 'grid' : 'hidden'} lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 lg:mb-8`}>
            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Papers</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalPapers}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Notes</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalNotes}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-success-100 rounded-lg">
                  <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Votes</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalVotes}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Views</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-warning-100 rounded-lg">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-warning-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Points</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-fluid-xs font-medium text-gray-600">Downloads</p>
                  <p className="text-fluid-xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="card p-4 sm:p-6 mb-6">
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
                  {DASHBOARD_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        activeTab === tab
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getTabIcon(tab)}
                      {getTabLabel(tab)}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <Link
                    to="/upload"
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center min-h-touch"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Paper
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center min-h-touch"
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
                      {DASHBOARD_TABS.map((tab) => (
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
                          <span className="ml-3">
                            {getTabLabel(tab)}
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
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="card p-4 sm:p-6 order-last">
                    <h2 className="text-fluid-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    {recentActivities.length > 0 ? (
                      <div className="space-y-4 sm:space-y-4">
                        {recentActivities.map((item) => (
                          <div key={`${item.contentType}-${item._id}`} className="p-4 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2 lg:space-x-3 min-w-0">
                                {item.contentType === 'note' ? (
                                  <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-500 mt-1 flex-shrink-0" />
                                ) : (
                                  <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 mt-1 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 text-fluid-sm line-clamp-2">{item.title}</p>
                                    <span className={`text-fluid-xs font-semibold px-2 py-0.5 rounded-full ${item.contentType === 'note' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'}`}>
                                      {item.contentType === 'note' ? 'Note' : 'Paper'}
                                    </span>
                                  </div>
                                  <p className="text-fluid-xs text-gray-600 mt-1 line-clamp-1">
                                    {item.course} • {item.department}
                                  </p>
                                  <p className="text-fluid-xs text-gray-500 mt-1">
                                    {getRecentActivitySummary(item)} • {formatActivityDate(item)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className={`px-2 py-1 rounded-full text-fluid-xs flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                                  {getStatusIcon(item.status)}
                                  <span className="hidden sm:inline">{getStatusText(item.status)}</span>
                                </span>
                                <Link
                                  to={item.contentType === 'note' ? `/notes/${item._id}` : `/papers/${item._id}`}
                                  className="text-fluid-xs text-primary-600 hover:text-primary-700"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 lg:py-8">
                        <FileText className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                        <h3 className="text-fluid-base font-medium text-gray-900 mb-2">No activity yet</h3>
                        <p className="text-fluid-sm text-gray-600 mb-4">Upload papers or notes to see your recent activity.</p>
                        <Link to="/upload" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-fluid-sm min-h-touch inline-flex items-center">
                          Upload Content
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="card p-4 sm:p-6">
                      <h3 className="text-fluid-base font-semibold text-gray-900 mb-3 lg:mb-4">Quick Upload</h3>
                      <p className="text-fluid-sm text-gray-600 mb-3 lg:mb-4">Share a new past paper with the community.</p>
                      <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-fluid-sm min-h-touch">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Paper
                      </Link>
                    </div>

                    <div className="card p-4 sm:p-6">
                      <h3 className="text-fluid-base font-semibold text-gray-900 mb-3 lg:mb-4">Request Paper</h3>
                      <p className="text-fluid-sm text-gray-600 mb-3 lg:mb-4">Ask the community for papers you need.</p>
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center text-fluid-sm w-full min-h-touch"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Open Requests
                      </button>
                    </div>
                  </div>

                  {/* User Badges Section */}
                  <div className="card p-4 sm:p-6">
                      <button
                        type="button"
                        onClick={() => setInfoModalType('badges')}
                        className="text-fluid-lg font-semibold text-gray-900 mb-4 flex items-center hover:text-primary-600"
                      >
                        <Award className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-primary-600" />
                        Your Badges
                      </button>
                      <div className="flex flex-wrap gap-3">
                        {(user?.badgeKeys || []).map((badgeKey) => (
                          <div key={badgeKey} className="transform transition-transform hover:scale-105">
                            <StyledBadge badgeKey={badgeKey} size="lg" />
                          </div>
                        ))}
                      </div>

                      {(!user?.badgeKeys || user.badgeKeys.length === 0) && (
                        <p className="text-fluid-sm text-gray-600">No badges unlocked yet. Start uploading papers or notes to earn your first badge.</p>
                      )}

                      <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-fluid-sm font-semibold text-gray-900">Badge Details and Progress</p>
                            <p className="text-fluid-xs text-gray-600 mt-1">
                              {(user?.badgeKeys || []).length} / {BADGE_PROGRESS_TARGETS.length} badges unlocked.
                              {nextBadgeTarget ? ` Next: ${nextBadgeTarget.label} (${nextBadgeProgress}%).` : ' All badges unlocked.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInfoModalType('badges')}
                            className="inline-flex items-center px-3 py-1.5 text-fluid-xs font-semibold bg-white text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 min-h-touch"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>

                  <div className="card p-4 sm:p-6">
                    <button
                      type="button"
                      onClick={() => setInfoModalType('points')}
                      className="text-fluid-lg font-semibold text-gray-900 mb-4 hover:text-primary-600"
                    >
                      Your Impact Metrics
                    </button>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Papers</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalPapers.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Notes</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalNotes.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Downloads</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Views</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Votes</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalVotes.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-fluid-xs text-gray-500">Points</p>
                        <p className="text-fluid-lg font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-fluid-sm font-semibold text-gray-700">Current Status</p>
                        <button
                          type="button"
                          onClick={() => setInfoModalType('status')}
                          className="inline-flex items-center text-fluid-xs font-semibold text-primary-700 hover:text-primary-800"
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Open Status Details
                        </button>
                      </div>
                      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-fluid-sm font-semibold">
                        {user?.contributorStatus || 'Student'}
                      </div>
                      {nextStatus ? (
                        <>
                          <p className="text-fluid-sm text-gray-700 mt-3 font-medium">
                            Next Status: {nextStatus.label}
                          </p>
                          <p className="text-fluid-sm text-gray-600">
                            Reputation: {contributionMetrics.points} / {nextStatus.minReputation}
                          </p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${statusReputationProgress}%` }} />
                          </div>
                        </>
                      ) : (
                        <p className="text-fluid-sm text-gray-600 mt-1">Highest status reached.</p>
                      )}
                    </div>
                  </div>

                  {/* Referral Code Section (Feature 14) */}
                  {user?.referralCode && (
                    <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg lg:rounded-xl p-4 sm:p-6 shadow-sm border border-primary-200">
                      <h2 className="text-fluid-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <Users className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-primary-600" />
                        Your Referral Code
                      </h2>
                      <p className="text-fluid-sm text-gray-600 mb-4">
                        Invite friends to join! Both you and your friend get <strong>20 reputation points</strong> when they upload their first paper.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white rounded-lg px-4 py-3 border-2 border-primary-300">
                          <p className="text-fluid-xs text-gray-500 mb-1">Your Code</p>
                          <p className="text-fluid-xl font-bold text-primary-600 tracking-wider">{user.referralCode}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.referralCode);
                            toast.success('Referral code copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-fluid-sm font-medium min-h-touch"
                        >
                          Copy Code
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-fluid-xs text-gray-500">Referral Link:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 text-fluid-xs text-gray-700 bg-gray-50 px-2 py-1 rounded overflow-x-auto">
                            {window.location.origin}/register?ref={user.referralCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`);
                              toast.success('Referral link copied!');
                            }}
                            className="text-fluid-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {notificationsData?.length > 0 && (
                    <div className="card p-4 sm:p-6">
                      <h2 className="text-fluid-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Bell className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-primary-600" />
                        Notifications
                      </h2>
                      <div className="space-y-2">
                        {notificationsData.slice(0, 5).map((n) => (
                          <div key={n._id} className={`p-3 rounded-lg border ${n.isRead ? 'bg-gray-50 border-gray-200' : 'bg-primary-50 border-primary-200'}`}>
                            <p className="text-fluid-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-fluid-xs text-gray-600 mt-1">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  <div className="card p-4 sm:p-6">
                    <h2 className="text-fluid-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-primary-600" />
                      Top Contributors
                    </h2>
                    {isLoadingLeaderboard ? (
                      <div className="text-center py-4">
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-14 rounded-lg"></div>
                          ))}
                        </div>
                      </div>
                    ) : topContributors.length > 0 ? (
                      <div className="space-y-2 lg:space-y-3">
                        {topContributors.map((u) => (
                          <div
                            key={u._id}
                            className={`flex items-center p-3 rounded-lg ${user?._id === u._id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
                          >
                            <div className={`w-6 lg:w-8 text-fluid-sm font-bold ${getRankColor(u.rank)}`}>
                              #{u.rank}
                            </div>
                            <div className="flex items-center flex-1 ml-2 lg:ml-3">
                              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 lg:mr-3">
                                {u.rank === 1 ? <Crown className="h-4 w-4 text-yellow-500" /> : <User className="h-4 w-4 text-gray-500" />}
                              </div>
                              <span className="font-semibold text-gray-800 text-fluid-sm">{u.username}</span>
                            </div>
                            <div className="text-fluid-sm font-bold text-primary-600">
                              {Number(u.points || 0).toLocaleString()} pts
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
                <div className="card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-6">
                    <h2 className="text-fluid-lg font-semibold text-gray-900">{isAdmin ? 'All Papers' : 'My Papers'}</h2>
                    <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-fluid-sm min-h-touch">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload New Paper
                    </Link>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-4 sm:p-6">
                          <div className="skeleton h-5 w-3/4 mb-3"></div>
                          <div className="skeleton h-4 w-1/2 mb-2"></div>
                          <div className="skeleton h-4 w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="skeleton h-6 w-20"></div>
                            <div className="skeleton h-6 w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (isAdmin ? papers?.papers?.length > 0 : papers?.length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {(isAdmin ? papers.papers : papers).map((paper) => (
                        <div key={paper._id} className="card-interactive p-4 sm:p-6 group">
                          <div className="flex justify-between items-start gap-3">
                            <Link to={`/papers/${paper._id}`} className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-2 line-clamp-2">
                                {paper.title}
                              </h3>
                            </Link>
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => handleMenuClick(e, paper._id)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 min-h-touch min-w-[44px] flex items-center justify-center"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              {openMenuId === paper._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                                  <div className="py-1">
                                    <button onClick={(e) => handleEdit(e, paper._id)} className="w-full text-left flex items-center px-4 py-2 text-fluid-sm text-gray-700 hover:bg-gray-100 min-h-touch">
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </button>
                                    <button onClick={(e) => handleMakePrivate(e, paper._id, paper.visibility)} className="w-full text-left flex items-center px-4 py-2 text-fluid-sm text-gray-700 hover:bg-gray-100 min-h-touch">
                                      {paper.visibility === 'private' ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                      {getVisibilityText(paper.visibility)}
                                    </button>
                                    <button onClick={(e) => handleDelete(e, paper._id)} className="w-full text-left flex items-center px-4 py-2 text-fluid-sm text-error-600 hover:bg-error-50 min-h-touch">
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            {paper.teacher && (
                              <p className="text-fluid-xs text-gray-500 line-clamp-1 pr-2">
                                Teacher: {paper.teacher}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 ml-auto">
                              <span className={`text-fluid-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(paper.status)}`}>
                                {getStatusText(paper.status)}
                              </span>
                              {paper.visibility === 'private' ? (
                                <span className="flex items-center text-fluid-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                  <EyeOff className="h-3 w-3 mr-1" /> Private
                                </span>
                              ) : (
                                <span className="flex items-center text-fluid-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <Eye className="h-3 w-3 mr-1" /> Public
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-fluid-sm text-gray-600 mt-1 line-clamp-1">
                            {paper.course} {paper.courseCode && `• ${paper.courseCode}`}
                          </p>
                          <div className="flex items-center justify-between text-fluid-xs text-gray-500 mt-1">
                            <span className="line-clamp-1 pr-2">{paper.university}</span>
                            <span className="line-clamp-1 text-right">{paper.department}</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-fluid-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center" title="Downloads"><Download className="h-4 w-4 mr-1.5" />{paper.downloadCount}</span>
                              <span className="flex items-center" title="Helpful Votes"><ThumbsUp className="h-4 w-4 mr-1.5" />{Array.isArray(paper.votedBy) ? paper.votedBy.length : paper.helpfulVotes || 0}</span>
                              <span className="flex items-center" title="Views"><Eye className="h-4 w-4 mr-1.5" />{paper.views || 0}</span>
                            </div>
                            <Link to={`/papers/${paper._id}`} className="text-primary-600 hover:text-primary-700 font-medium text-fluid-xs group-hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <FileText className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                      <h3 className="text-fluid-base font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
                      <p className="text-fluid-sm text-gray-600 mb-4">Start sharing your past papers with the community</p>
                      <Link to="/upload" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-fluid-sm min-h-touch inline-flex items-center">
                        Upload Your First Paper
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-6">
                    <h2 className="text-fluid-lg font-semibold text-gray-900">My Notes</h2>
                    <Link
                      to="/upload"
                      state={{ activeTab: 'notes' }}
                      className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-fluid-sm min-h-touch"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload New Note
                    </Link>
                  </div>

                  {isLoadingNotes ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-4 sm:p-6">
                          <div className="skeleton h-5 w-3/4 mb-3"></div>
                          <div className="skeleton h-4 w-1/2 mb-2"></div>
                          <div className="skeleton h-4 w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="skeleton h-6 w-20"></div>
                            <div className="skeleton h-6 w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userNotes?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {userNotes.map((note) => (
                        <div key={note._id} className="card-interactive p-4 sm:p-6 group">
                          <div className="flex justify-between items-start gap-3">
                            <Link to={`/notes/${note._id}`} className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-2 line-clamp-2">
                                {note.title}
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-2 ml-auto">
                              <span className={`text-fluid-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(note.status)}`}>
                                {getStatusText(note.status)}
                              </span>
                              {note.visibility === 'private' ? (
                                <span className="flex items-center text-fluid-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                  <EyeOff className="h-3 w-3 mr-1" /> Private
                                </span>
                              ) : (
                                <span className="flex items-center text-fluid-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <Eye className="h-3 w-3 mr-1" /> Public
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-fluid-sm text-gray-600 mt-1 line-clamp-1">
                            {note.course} {note.courseCode && `• ${note.courseCode}`}
                          </p>
                          <div className="flex items-center justify-between text-fluid-xs text-gray-500 mt-1">
                            <span className="line-clamp-1 pr-2">{note.university}</span>
                            <span className="line-clamp-1 text-right">{note.department}</span>
                          </div>
                          <div className="text-fluid-xs text-gray-500 mt-1">
                            {note.semester} {note.year}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-fluid-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center" title="Downloads"><Download className="h-4 w-4 mr-1.5" />{note.downloadCount || 0}</span>
                              <span className="flex items-center" title="Helpful Votes"><ThumbsUp className="h-4 w-4 mr-1.5" />{Array.isArray(note.votedBy) ? note.votedBy.length : note.helpfulVotes || 0}</span>
                              <span className="flex items-center" title="Views"><Eye className="h-4 w-4 mr-1.5" />{note.views || 0}</span>
                            </div>
                            <Link to={`/notes/${note._id}`} className="text-primary-600 hover:text-primary-700 font-medium text-fluid-xs group-hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <BookOpen className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                      <h3 className="text-fluid-base font-medium text-gray-900 mb-2">No notes uploaded yet</h3>
                      <p className="text-fluid-sm text-gray-600 mb-4">Upload study notes and track their approval status here.</p>
                      <Link
                        to="/upload"
                        state={{ activeTab: 'notes' }}
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-fluid-sm min-h-touch inline-flex items-center"
                      >
                        Upload Your First Note
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="card p-4 sm:p-6">
                  <h2 className="text-fluid-lg font-semibold text-gray-900 mb-6">My Download History</h2>
                  {isLoadingDownloads ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-20 rounded-lg"></div>
                      ))}
                    </div>
                  ) : downloadedPapers && downloadedPapers.length > 0 ? (
                    <>
                      {/* Mobile: Stacked Card Layout */}
                      <div className="block md:hidden space-y-4">
                        {downloadedPapers
                          .filter(download => download.paper)
                          .map((download) => (
                            <div key={download._id} className="card-interactive p-4">
                              <h3 className="font-medium text-gray-900 text-fluid-sm line-clamp-2 mb-2">{download.paper.title}</h3>
                              <p className="text-fluid-xs text-gray-500 mb-1">{download.paper.course}</p>
                              <p className="text-fluid-xs text-gray-400 mb-3">
                                Downloaded: {new Date(download.downloadedAt).toLocaleDateString()}
                              </p>
                              <Link
                                to={`/papers/${download.paper._id}`}
                                className="text-primary-600 hover:text-primary-900 text-fluid-sm font-medium min-h-touch inline-flex items-center"
                              >
                                View Paper
                              </Link>
                            </div>
                          ))}
                      </div>

                      {/* Desktop: Table Layout */}
                      <div className="hidden md:block overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                          <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-3 text-left text-fluid-xs font-medium text-gray-500 uppercase tracking-wider">Paper Title</th>
                                  <th className="px-3 py-3 text-left text-fluid-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                  <th className="px-3 py-3 text-left text-fluid-xs font-medium text-gray-500 uppercase tracking-wider">Downloaded On</th>
                                  <th className="px-3 py-3 text-left text-fluid-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {downloadedPapers
                                  .filter(download => download.paper)
                                  .map((download) => (
                                    <tr key={download._id}>
                                      <td className="px-3 py-4 text-fluid-sm font-medium text-gray-900">
                                        <div className="line-clamp-2 max-w-xs">{download.paper.title}</div>
                                      </td>
                                      <td className="px-3 py-4 text-fluid-sm text-gray-500">{download.paper.course}</td>
                                      <td className="px-3 py-4 text-fluid-sm text-gray-500">
                                        {new Date(download.downloadedAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-3 py-4 text-fluid-sm font-medium">
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
                    </>
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <Download className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                      <h3 className="text-fluid-base font-medium text-gray-900 mb-2">No downloads yet</h3>
                      <p className="text-fluid-sm text-gray-600 mb-4">Papers you download will appear here</p>
                      <Link to="/papers" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-fluid-sm min-h-touch inline-flex items-center">
                        Browse Papers
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4">
                    <div>
                      <h2 className="text-fluid-lg font-semibold text-gray-900">My Requested Papers</h2>
                      <p className="text-fluid-sm text-gray-600">Showing only your open and fulfilled requests.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary min-h-touch"
                      onClick={() => setIsRequestFormOpen(true)}
                    >
                      Request a Paper
                    </button>
                  </div>

                  {isLoadingRequests ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-28 rounded-lg"></div>
                      ))}
                    </div>
                  ) : myRequests.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      {myRequests.map((req) => (
                        <div key={req._id} className="card-interactive p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-fluid-base">{req.title?.trim() || `${req.courseName} (${req.examType.toUpperCase()} ${req.year})`}</p>
                              <p className="text-fluid-sm text-gray-600">{req.courseName} ({req.examType.toUpperCase()} {req.year})</p>
                              <p className="text-fluid-sm text-gray-600">{req.university} • {req.department}</p>
                              <p className="text-fluid-xs text-gray-500 mt-1">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-fluid-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${req.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 flex items-end justify-between gap-3">
                            <div className="text-fluid-sm min-h-[1.5rem] text-gray-700">
                              {req.status === 'fulfilled' && req.fulfilledByPaper?._id ? (
                                <>
                                  Fulfilled paper:{' '}
                                  <Link className="text-primary-600 hover:underline" to={`/papers/${req.fulfilledByPaper._id}`}>
                                    {req.fulfilledByPaper.title}
                                  </Link>
                                </>
                              ) : (
                                <>
                                  Have this paper?{' '}
                                  <Link className="text-primary-600 hover:underline" to={`/upload?requestId=${req._id}`}>
                                    Upload now to fulfill it
                                  </Link>
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn-secondary text-fluid-sm whitespace-nowrap min-h-touch"
                              onClick={() => setSelectedRequest(req)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-fluid-sm">No requests found.</div>
                  )}

                  {isRequestFormOpen && (
                    <div className="fixed inset-0 z-[70] bg-black/50 p-4 sm:p-6 overflow-y-auto" onClick={() => setIsRequestFormOpen(false)}>
                      <div
                        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-fluid-xl font-bold text-gray-900">Request a Paper</h3>
                            <p className="text-fluid-sm text-gray-600 mt-1">Submit what you need and contributors can fulfill it.</p>
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 min-h-touch min-w-[44px] flex items-center justify-center"
                            onClick={() => setIsRequestFormOpen(false)}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <form
                          className="p-4 sm:p-6 space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!user) {
                              toast.error('Please sign in to request a paper.');
                              return;
                            }
                            createRequestMutation.mutate();
                          }}
                        >
                          <input
                            className="input-field min-h-touch"
                            placeholder="Request Title (optional)"
                            value={requestFormData.title}
                            onChange={(e) => setRequestFormData((p) => ({ ...p, title: e.target.value }))}
                          />
                          <textarea
                            className="input-field"
                            rows={3}
                            placeholder="Describe what kind of paper/content you need (optional)"
                            value={requestFormData.description}
                            onChange={(e) => setRequestFormData((p) => ({ ...p, description: e.target.value }))}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <input
                              className="input-field min-h-touch"
                              placeholder="University"
                              value={requestFormData.university}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, university: e.target.value }))}
                              required
                            />
                            <input
                              className="input-field min-h-touch"
                              placeholder="Department"
                              value={requestFormData.department}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, department: e.target.value }))}
                              required
                            />
                            <input
                              className="input-field min-h-touch"
                              placeholder="Course Name"
                              value={requestFormData.courseName}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, courseName: e.target.value }))}
                              required
                            />
                            <input
                              className="input-field min-h-touch"
                              placeholder="Course Code"
                              value={requestFormData.courseCode}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, courseCode: e.target.value }))}
                            />
                            <input
                              className="input-field min-h-touch"
                              placeholder="Teacher"
                              value={requestFormData.teacher}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, teacher: e.target.value }))}
                            />
                            <input
                              className="input-field min-h-touch"
                              placeholder="Semester"
                              value={requestFormData.semester}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, semester: e.target.value }))}
                            />
                            <select
                              className="input-field min-h-touch"
                              value={requestFormData.examType}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, examType: e.target.value }))}
                            >
                              <option value="final">Final</option>
                              <option value="mid">Midterm</option>
                              <option value="quiz">Quiz</option>
                              <option value="assignment">Assignment</option>
                            </select>
                            <input
                              type="number"
                              className="input-field min-h-touch"
                              min="2000"
                              max="2100"
                              value={requestFormData.year}
                              onChange={(e) => setRequestFormData((p) => ({ ...p, year: Number(e.target.value) }))}
                              required
                            />
                          </div>
                          <input
                            className="input-field min-h-touch"
                            placeholder="Tags (comma separated)"
                            value={requestFormData.tags}
                            onChange={(e) => setRequestFormData((p) => ({ ...p, tags: e.target.value }))}
                          />

                          <div className="pt-2 flex items-center justify-end gap-2">
                            <button type="button" className="btn-secondary min-h-touch" onClick={() => setIsRequestFormOpen(false)}>
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-primary min-h-touch"
                              disabled={createRequestMutation.isLoading}
                            >
                              {createRequestMutation.isLoading ? 'Posting...' : 'Post Request'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {selectedRequest && (
                    <div className="fixed inset-0 z-[70] bg-black/50 p-4 sm:p-6 overflow-y-auto" onClick={() => setSelectedRequest(null)}>
                      <div
                        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-fluid-xl font-bold text-gray-900">{selectedRequest.title?.trim() || 'Requested Paper Details'}</h3>
                            <p className="text-fluid-sm text-gray-600 mt-1">Full request information for contributor/admin verification.</p>
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 min-h-touch min-w-[44px] flex items-center justify-center"
                            onClick={() => setSelectedRequest(null)}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-fluid-sm">
                          <div>
                            <p className="text-gray-500">Course</p>
                            <p className="font-semibold text-gray-900">{selectedRequest.courseName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Exam Type</p>
                            <p className="font-semibold text-gray-900 capitalize">{selectedRequest.examType}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Year</p>
                            <p className="font-semibold text-gray-900">{selectedRequest.year}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{selectedRequest.status}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">University</p>
                            <p className="font-semibold text-gray-900">{selectedRequest.university}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Department</p>
                            <p className="font-semibold text-gray-900">{selectedRequest.department}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Requested On</p>
                            <p className="font-semibold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-gray-500">Description</p>
                            <p className="font-medium text-gray-900 whitespace-pre-wrap mt-1">
                              {selectedRequest.description?.trim() || 'No additional description was provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-end">
                          <button type="button" className="btn-secondary min-h-touch" onClick={() => setSelectedRequest(null)}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="space-y-6">
                  {user && (
                    <div>
                      <h2 className="text-fluid-lg font-semibold text-gray-900 mb-6">Your Certificates</h2>

                      {myCertsLoading ? (
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-48 rounded-lg"></div>
                          ))}
                        </div>
                      ) : myCerts?.certificates && myCerts.certificates.length > 0 ? (
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                          {myCerts.certificates.map((cert) => (
                            <div
                              key={cert._id}
                              className="card p-4 sm:p-6 border-t-4 border-yellow-400 hover:shadow-xl transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-fluid-lg font-semibold text-gray-900">{cert.display.title}</h3>
                                  <p className="text-fluid-sm text-gray-600">{cert.display.subtitle}</p>
                                </div>
                                <Award className="w-8 h-8 text-yellow-500" />
                              </div>

                              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 mb-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-fluid-sm text-gray-600">Papers Uploaded</span>
                                  <span className="font-bold text-gray-900">{cert.display.stats.papersUploaded}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-fluid-sm text-gray-600">Total Downloads</span>
                                  <span className="font-bold text-gray-900">{cert.display.stats.totalDownloads}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-fluid-sm text-gray-600">Reputation Points</span>
                                  <span className="font-bold text-gray-900">{cert.display.stats.reputation}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-fluid-sm text-gray-600">Universities Reached</span>
                                  <span className="font-bold text-gray-900">{cert.display.stats.universitiesReached}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `/api/certificates/${cert._id}/download`;
                                    link.download = `certificate-${user.username}-${cert._id}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2 text-fluid-sm min-h-touch"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-fluid-sm min-h-touch">
                                  Share
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="card p-6 sm:p-8 md:p-12 text-center mb-8">
                          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-fluid-lg font-semibold text-gray-900 mb-2">No Certificates Earned Yet</h3>
                          <div className="max-w-md mx-auto">
                            <p className="text-gray-600 mb-4 text-fluid-sm">
                              Certificates are automatically awarded at the end of each semester to top contributors based on:
                            </p>
                            <ul className="text-left text-fluid-sm text-gray-600 mb-4 space-y-2">
                              <li className="flex items-start">
                                <span className="text-primary-600 mr-2">•</span>
                                <span>Number of approved papers uploaded</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-primary-600 mr-2">•</span>
                                <span>Total downloads from your papers</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-primary-600 mr-2">•</span>
                                <span>Overall reputation points earned</span>
                              </li>
                            </ul>
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                              <p className="text-fluid-xs text-primary-800">
                                <strong>Certificate Types:</strong> Top Contributor (Top 10), Active Contributor (Top 50), Emerging Contributor (Top 100)
                              </p>
                            </div>
                            <Link to="/upload" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center min-h-touch">
                              Start Contributing
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certificate Leaderboard */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
                      <h2 className="text-fluid-lg font-semibold text-gray-900">Certificate Leaderboard</h2>
                      <select
                        value={`${selectedSemester.semester}-${selectedSemester.year}`}
                        onChange={(e) => {
                          const [sem, yr] = e.target.value.split('-');
                          setSelectedSemester({ semester: sem, year: parseInt(yr) });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-touch"
                      >
                        {['Spring', 'Fall', 'Summer'].map((sem) => {
                          const years = [2026, 2025, 2024];
                          return years.map((year) => (
                            <option key={`${sem}-${year}`} value={`${sem}-${year}`}>
                              {sem} {year}
                            </option>
                          ));
                        })}
                      </select>
                    </div>

                    {leaderboardLoading ? (
                      <div className="space-y-4 sm:space-y-6">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="skeleton h-20 rounded-lg"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {['top_contributor', 'active_contributor', 'emerging_contributor'].map((type) => {
                          const certs = leaderboard?.certificates?.[type] || [];
                          if (certs.length === 0) return null;

                          const typeLabels = {
                            top_contributor: 'Top Contributors',
                            active_contributor: 'Active Contributors',
                            emerging_contributor: 'Emerging Contributors',
                          };

                          return (
                            <div key={type}>
                              <h3 className="text-fluid-lg font-semibold text-gray-900 mb-3">{typeLabels[type]}</h3>
                              <div className="grid gap-4 sm:gap-6">
                                {certs.map((cert) => (
                                  <div
                                    key={cert._id}
                                    className="card p-4 sm:p-6 border-l-4 border-primary-500 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="flex items-center gap-4">
                                        <div className="text-fluid-xl font-bold text-primary-600 w-12 text-center">
                                          #{cert.rank}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-gray-900 text-fluid-base">{cert.user.username}</h4>
                                          <p className="text-fluid-sm text-gray-600">{cert.user.university}</p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-4 gap-4 text-center">
                                        <div>
                                          <p className="text-fluid-xs text-gray-500">Papers</p>
                                          <p className="font-bold text-gray-900">{cert.display.stats.papersUploaded}</p>
                                        </div>
                                        <div>
                                          <p className="text-fluid-xs text-gray-500">Downloads</p>
                                          <p className="font-bold text-gray-900">{cert.display.stats.totalDownloads}</p>
                                        </div>
                                        <div>
                                          <p className="text-fluid-xs text-gray-500">Reputation</p>
                                          <p className="font-bold text-gray-900">{cert.display.stats.reputation}</p>
                                        </div>
                                        <div>
                                          <p className="text-fluid-xs text-gray-500">Reach</p>
                                          <p className="font-bold text-gray-900">{cert.display.stats.universitiesReached}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="card p-4 sm:p-6">
                  <h2 className="text-fluid-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-6">

                      {/* Profile Picture Upload */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-fluid-base font-medium text-gray-900 mb-4">Profile Picture</h3>
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
                      className="px-4 py-2 border border-gray-300 rounded-lg text-fluid-sm font-medium text-gray-700 hover:bg-gray-50 min-h-touch"
                    >
                      Change Picture
                    </button>
                    {profilePictureFile && <p className="text-fluid-xs text-gray-500">New picture selected!</p>}
                  </div>
                </div>
              </div>


                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-fluid-base font-medium text-gray-900 mb-4">Profile Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              name="username"
                              value={profileData.username}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                            />
                          </div>
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              defaultValue={user?.email}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-touch"
                              disabled
                            />
                            <p className="mt-1 text-fluid-xs text-gray-500">Email cannot be changed.</p>
                          </div>
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">University</label>
                            <input
                              type="text"
                              name="university"
                              value={profileData.university}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                            />
                          </div>
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                              type="text"
                              name="department"
                              value={profileData.department}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                            />
                          </div>
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">Semester</label>
                            <input
                              type="text"
                              name="semester"
                              value={profileData.semester}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                            />
                          </div>
                          <div>
                            <label className="block text-fluid-sm font-medium text-gray-700 mb-1">Batch</label>
                            <input
                              type="text"
                              name="batch"
                              value={profileData.batch}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-touch"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-touch"
                            disabled={updateProfileMutation.isLoading}
                          >
                            {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-fluid-base font-medium text-gray-900 mb-4">Account Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <button
                            onClick={handleChangePassword}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center min-h-touch"
                          >
                            <Key className="h-4 w-4 mr-2" /> Change Password
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center min-h-touch"
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