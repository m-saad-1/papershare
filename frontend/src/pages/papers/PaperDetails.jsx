import React, { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext.jsx';
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

const PaperDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [otherReportReason, setOtherReportReason] = useState('');

  const { data: paper, isLoading } = useQuery(
    ['paper', id],
    async () => {
      const response = await axios.get(`/papers/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const viewIncremented = React.useRef(false);

  const { mutate: incrementView } = useMutation(
    () => axios.put(`/papers/${id}/view`),
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
    () => axios.get(`/papers/${id}/download`, { responseType: 'blob' }),
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
    ({ reason }) => axios.post(`/papers/${id}/report`, { reason }),
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
    ({ isVoting }) => axios.put(`/papers/${id}/vote`, { vote: isVoting }),
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
      toast.error('Please sign in to download papers');
      navigate('/login');
      return;
    }
    downloadMutation.mutate();
  };

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      navigate('/login');
      return;
    }
    const userId = user?._id || user?.id;
    const hasVoted = paper?.votedBy?.some(voterId => voterId.toString() === userId.toString());
    voteMutation.mutate({ isVoting: !hasVoted });
  };

  const handleReport = (e) => {
    e.preventDefault();
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
  }, [paper?.title]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to papers
        </button>

        {/* Main Content */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{paper.title}</h1>
                <p className="text-primary-100 text-lg mb-4">
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
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                {paper.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{paper.description}</p>
                  </div>
                )}

                {/* File Info */}
                {paper.file && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Name</span>
                        <span className="font-medium">{paper.file?.originalName}</span>
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
                  <div className="mb-6">
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
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <Link to={`/profile/${paper.uploader?._id}`} className="font-medium text-gray-900 hover:text-primary-600 hover:underline">
                          {paper.uploader?.username}
                        </Link>
                        <p className="text-sm text-gray-600">{paper.uploader?.department}</p>
                      </div>
                    </div>
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
                        <span className="font-semibold">{paper.helpfulVotes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      disabled={downloadMutation.isLoading}
                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadMutation.isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                          Downloading...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Download className="h-5 w-5 mr-2" />
                          Download Paper
                        </div>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleVote}
                        disabled={voteMutation.isLoading}
                        className={`btn-secondary flex items-center justify-center disabled:opacity-70 ${isAuthenticated && paper?.votedBy?.includes(user?._id || user?.id) ? 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100' : ''}`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {isAuthenticated && paper?.votedBy?.includes(user?._id || user?.id) ? 'Voted' : 'Helpful'}
                      </button>
                      <button onClick={handleShare} className="btn-secondary flex items-center justify-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                    </div>

                    {isAuthenticated && (
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full btn-secondary text-error-600 hover:text-error-700 flex items-center justify-center"
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Papers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Similar papers would be fetched here */}
            <div className="card p-4 text-center">
              <p className="text-gray-600">More papers from {paper.course} coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Paper</h3>
            <form onSubmit={handleReport}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="wrong_content">Wrong content</option>
                    <option value="broken_file">Broken file</option>
                    <option value="duplicate">Duplicate paper</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                {reportReason === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please describe the issue
                    </label>
                    <textarea
                      rows={3}
                      className="input-field"
                      value={otherReportReason}
                      onChange={(e) => setOtherReportReason(e.target.value)}
                      placeholder="Describe the problem you encountered..."
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportMutation.isLoading}
                  className="btn-primary bg-error-600 hover:bg-error-700 disabled:opacity-50"
                >
                  {reportMutation.isLoading ? 'Reporting...' : 'Report Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetails;