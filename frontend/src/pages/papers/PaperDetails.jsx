import React, { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext.jsx';
import apiClient from '@/apiClient';
import {
  Download,
  Star,
  FileText,
  Calendar,
  Building2,
  BookOpen,
  User,
  Flag,
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2
} from 'lucide-react';

import AuthModal from '@/components/auth/AuthModal';
import ReportPaperModal from '@/components/papers/ReportPaperModal';
import { mapBadgeKeys } from '@/utils/badges';
import { StyledBadge } from '@/components/badges/StyledBadge';
import { getContributorStatusMeta } from '@/utils/contributorStatus';

const PaperDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [otherReportReason, setOtherReportReason] = useState('');

  const { data: paper, isLoading } = useQuery(
    ['paper', id],
    async () => {
      const response = await apiClient.get(`/papers/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const viewIncremented = React.useRef(false);

  const { mutate: incrementView } = useMutation(
    () => apiClient.put(`/papers/${id}/view`),
    {
      onMutate: async () => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries(['paper', id]);

        // Snapshot the previous value
        const previousPaper = queryClient.getQueryData(['paper', id]);

        // Optimistically update to the new value
        const userId = user?._id || user?.id;
        queryClient.setQueryData(['paper', id], (old) => ({
          ...old,
          views: (old?.views || 0) + 1,
          viewedBy: [...(Array.isArray(old?.viewedBy) ? old.viewedBy : []), userId],
        }));

        // Return a context object with the snapshotted value
        return { previousPaper };
      },
      // If the mutation fails, use the context we returned to roll back
      onError: (err, newTodo, context) => {
        queryClient.setQueryData(['paper', id], context.previousPaper);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['paper', id]);
      },
      onSuccess: () => {
        viewIncremented.current = false;
      }
    }
  );

  React.useEffect(() => {
    const userId = user?._id || user?.id;

    // Only count views for authenticated users who are not the uploader
    if (paper && isAuthenticated && userId && userId !== paper.uploader?._id) {
      const userHasViewed = Array.isArray(paper.viewedBy) && paper.viewedBy.includes(userId);

      // We use a ref to make sure we only call this ONCE per component lifecycle
      // if the user hasn't already viewed the paper in the initial data load.
      if (!userHasViewed && !viewIncremented.current) {
        // Mark that we are attempting to increment the view.
        viewIncremented.current = true;
        incrementView();
      }
    }
    // This effect should run when the main data (paper, user) changes.
  }, [paper, isAuthenticated, user, incrementView]);

  const downloadMutation = useMutation(
    () => apiClient.get(`/papers/${id}/download`, { responseType: 'blob' }),
    {
      onSuccess: (response) => {
        // Create blob link and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', paper.file.originalName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Paper downloaded successfully!');
        queryClient.invalidateQueries(['paper', id]);
      },
      onError: () => {
        toast.error('Failed to download paper');
      }
    }
  );

  const reportMutation = useMutation(
    ({ reason }) => apiClient.post(`/papers/${id}/report`, { reason }),
    {
      onSuccess: () => {
        toast.success('Paper reported successfully');
        setShowReportModal(false);
        setReportReason('');
        setOtherReportReason('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to report paper');
      },
    }
  );

  const voteMutation = useMutation(
    ({ isVoting }) => apiClient.put(`/papers/${id}/vote`, { vote: isVoting }),
    {
      onMutate: async ({ isVoting }) => {
        await queryClient.cancelQueries(['paper', id]);
        const previousPaper = queryClient.getQueryData(['paper', id]);
        const userId = user?._id || user?.id;

        queryClient.setQueryData(['paper', id], (old) => {
          if (!old) return;
          const currentVotes = old.helpfulVotes || 0;
          const currentVoters = Array.isArray(old.votedBy) ? old.votedBy : [];

          return {
            ...old,
            helpfulVotes: isVoting ? currentVotes + 1 : Math.max(0, currentVotes - 1),
            votedBy: isVoting
              ? [...currentVoters, userId]
              : currentVoters.filter(voterId => voterId !== userId),
          };
        });
        return { previousPaper };
      },
      onError: (err, newTodo, context) => {
        queryClient.setQueryData(['paper', id], context.previousPaper);
        toast.error(err.response?.data?.message || 'Failed to update vote.');
      },
      onSettled: () => {
        queryClient.invalidateQueries(['paper', id]);
      }
    }
  );

  const handleDownload = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    downloadMutation.mutate();
  };

  const handleVote = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (isAuthenticated && user?._id === paper.uploader?._id) {
      toast.error("You cannot vote for your own paper.");
      return;
    }

    const userId = user?._id || user?.id;
    const hasVoted = Array.isArray(paper?.votedBy)
      ? paper.votedBy.some((voterId) => String(voterId) === String(userId))
      : false;
    voteMutation.mutate({ isVoting: !hasVoted });
  };

  const currentUserId = user?._id || user?.id;
  const currentUserHasVoted = Array.isArray(paper?.votedBy)
    ? paper.votedBy.some((voterId) => String(voterId) === String(currentUserId))
    : false;

  const handleReport = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!reportReason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    let reportData = { reason: reportReason };

    if (reportReason === 'other') {
      if (!otherReportReason) {
        toast.error('Please describe the issue');
        return;
      }
      reportData = { reason: 'other', description: otherReportReason };
    }

    reportMutation.mutate(reportData);
  };

  const handleShare = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const shareUrl = window.location.href;
    const shareTitle = paper?.title || "Paper Details";

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(shareUrl).catch((error) => {
        console.error('Error copying to clipboard:', error);
      });
    }
  }, [paper?.title, isAuthenticated]);

  const paperTypeConfig = {
    mid: { label: 'Midterm', color: 'bg-blue-100 text-blue-800' },
    final: { label: 'Final', color: 'bg-purple-100 text-purple-800' },
    quiz: { label: 'Quiz', color: 'bg-green-100 text-green-800' },
    assignment: { label: 'Assignment', color: 'bg-orange-100 text-orange-800' },
    default: { label: 'Paper', color: 'bg-gray-100 text-gray-800' },
  };

  const getPaperTypeInfo = (type) => {
    return paperTypeConfig[type] || {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      ...paperTypeConfig.default
    };
  }

  const uploaderBadges = mapBadgeKeys(paper?.uploader?.badgeKeys || []);
  const uploaderStatus = getContributorStatusMeta(paper?.uploader?.contributorStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paper Not Found</h2>
            <p className="text-gray-600 mb-6">The paper you are looking for does not exist or has been removed.</p>
            <Link to="/papers" className="btn-primary flex items-center justify-center">
              Browse Papers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 md:mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to papers
        </button>

        {/* Main Content */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-6 sm:px-6 sm:py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-fluid-2xl font-bold mb-2">{paper.title}</h1>
                <p className="text-primary-100 text-fluid-base mb-4">
                  {paper.course} • {paper.courseCode}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    {paper.university}
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {paper.department}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {paper.year}
                  </span>
                  {paper.teacher && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {paper.teacher}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 lg:ml-6">
                <span className={`badge ${getPaperTypeInfo(paper.paperType).color} text-sm px-3 py-1`}>
                  {getPaperTypeInfo(paper.paperType).label}
                </span>
              </div>
            </div>
          </div>

          {/* Paper Details */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Main Info */}
              <div className="lg:col-span-3">
                {paper.description && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-fluid-base text-gray-700 leading-relaxed">{paper.description}</p>
                  </div>
                )}

                {/* File Info */}
                {paper.file && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 md:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-600 flex-shrink-0">File Name</span>
                        <span className="font-medium line-clamp-1 text-right max-w-[70%]">{paper.file?.originalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size</span>
                        <span className="font-medium">
                          {(paper.file?.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Type</span>
                        <span className="font-medium">PDF Document</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {paper.tags && paper.tags.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {paper.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  {/* Uploader Info */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Uploaded By</h3>
                    <div className="flex items-start space-x-3">
                      {paper.uploader?.profilePicture ? (
                        <img src={`${apiClient.defaults.baseURL.replace('/api', '')}/${paper.uploader.profilePicture.replace(/\\/g, '/')}`} alt={paper.uploader.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/profile/${paper.uploader?._id}`} className="font-medium text-gray-900 hover:text-primary-600 hover:underline line-clamp-1 min-w-0 flex-1">
                            {paper.uploader?.username}
                          </Link>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                            {Number(paper.uploader?.reputation || 0).toLocaleString()} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-semibold shadow-sm ${uploaderStatus.className}`}>
                            {uploaderStatus.label}
                          </span>
                          <p className="text-sm text-gray-600 line-clamp-1">{paper.uploader?.department}</p>
                        </div>
                      </div>
                    </div>
                    {uploaderBadges.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-3 gap-0.5">
                        {uploaderBadges.map((badge) => (
                          <div key={badge.key} className="origin-left scale-95">
                            <StyledBadge badgeKey={badge.key} size="sm" showName={false} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          Downloads
                        </span>
                        <span className="font-semibold">{paper.downloadCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Views
                        </span>
                        <span className="font-semibold">{paper.views || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Helpful Votes
                        </span>
                        <span className="font-semibold">{Array.isArray(paper.votedBy) ? paper.votedBy.length : paper.helpfulVotes || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      disabled={downloadMutation.isLoading}
                      className="w-full btn-primary min-h-touch disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {downloadMutation.isLoading ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download Paper
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleVote}
                        disabled={voteMutation.isLoading || (isAuthenticated && user?._id === paper.uploader?._id)}
                        className={`btn-secondary min-h-touch flex items-center justify-center disabled:opacity-70 ${isAuthenticated && currentUserHasVoted ? 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100' : ''}`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {isAuthenticated && currentUserHasVoted ? 'Voted' : 'Helpful'}
                      </button>
                      <button onClick={handleShare} className="btn-secondary min-h-touch flex items-center justify-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full btn-secondary min-h-touch text-error-600 hover:text-error-700 flex items-center justify-center"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report Issue
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full btn-secondary min-h-touch text-error-600 hover:text-error-700 flex items-center justify-center"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Papers Section */}
        <div className="mt-8">
          <h2 className="text-fluid-2xl font-bold text-gray-900 mb-4 md:mb-6">Similar Papers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Similar papers would be fetched here */}
            <div className="card p-4 text-center">
              <p className="text-gray-600">More papers from {paper.course} coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Report Modal (Feature 16) */}
      {showReportModal && (
        <ReportPaperModal
          paperId={id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default PaperDetails;