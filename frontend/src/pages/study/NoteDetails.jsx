import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Building2, BookOpen, Download, ThumbsUp, Eye, User, Share2, Flag } from 'lucide-react';
import apiClient from '@/apiClient';
import { useAuth } from '@/context/AuthContext';
import { mapBadgeKeys } from '@/utils/badges';
import { StyledBadge } from '@/components/badges/StyledBadge';
import { getContributorStatusMeta } from '@/utils/contributorStatus';
import ReportContentModal from '@/components/reports/ReportContentModal';

const NoteDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery(['note-details', id], async () => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  }, {
    enabled: !!id,
  });

  const note = data?.note;
  const base = apiClient.defaults.baseURL?.replace('/api', '') || '';
  const fileUrl = data?.fileUrl ? `${base}${data.fileUrl}` : null;
  const isPdf = useMemo(() => {
    return String(note?.file?.mimetype || '').toLowerCase().includes('pdf');
  }, [note?.file?.mimetype]);
  const uploaderBadges = mapBadgeKeys(note?.uploader?.badgeKeys || []);
  const uploaderStatus = getContributorStatusMeta(note?.uploader?.contributorStatus);
  const currentUserId = user?._id || user?.id;
  const currentUserHasVoted = Array.isArray(note?.votedBy)
    ? note.votedBy.some((voterId) => String(voterId) === String(currentUserId))
    : false;

  useEffect(() => {
    if (!id) return;
    apiClient.post(`/notes/${id}/view`).catch(() => {
      // Ignore analytics failures so viewing never breaks UX.
    });
  }, [id]);

  const downloadMutation = useMutation(async () => {
    const response = await apiClient.post(`/notes/${id}/download`);
    return response.data;
  }, {
    onSuccess: (responseData) => {
      queryClient.invalidateQueries('notes-page-notes');
      queryClient.invalidateQueries(['note-details', id]);
      const downloadUrl = responseData?.fileUrl ? `${base}${responseData.fileUrl}` : fileUrl;
      if (!downloadUrl) {
        toast.error('Download URL is not available');
        return;
      }
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Unable to download note');
    },
  });

  const voteMutation = useMutation(async () => {
    const response = await apiClient.patch(`/notes/${id}/vote`);
    return response.data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes-page-notes');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Unable to vote');
    },
  });

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = note?.title || 'Note Details';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } catch {
        // Ignore dismissed share dialogs.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="h-[480px] bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Note not found</h2>
            <p className="text-gray-600 mb-4">This note may have been removed or is unavailable.</p>
            <Link to="/notes" className="btn-primary inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link to="/notes" className="inline-flex items-center text-sm text-primary-700 hover:text-primary-800 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 card p-4 sm:p-6">
            <h1 className="text-fluid-2xl font-bold text-gray-900">{note.title}</h1>
            <p className="text-fluid-base text-gray-600 mt-3">{note.description || 'No description provided.'}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <p className="flex items-center"><BookOpen className="h-4 w-4 mr-2" />{note.course}{note.courseCode ? ` • ${note.courseCode}` : ''}</p>
              <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{note.semester} {note.year}</p>
              <p className="flex items-center"><Building2 className="h-4 w-4 mr-2" />{note.university}</p>
              <p className="truncate">{note.department}</p>
            </div>

            <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-semibold text-gray-700">Document Preview</p>
                <div className="flex items-center gap-3 min-w-0">
                  {note.file?.originalName && (
                    <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[260px]">{note.file.originalName}</p>
                  )}
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary-700 hover:text-primary-800 whitespace-nowrap"
                    >
                      Open full view
                    </a>
                  )}
                </div>
              </div>

              {isPdf && fileUrl ? (
                <iframe
                  title="Note PDF Preview"
                  src={fileUrl}
                  className="w-full h-[52vh] sm:h-[68vh]"
                  loading="lazy"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-700 font-medium">Preview is available only for PDF files.</p>
                  <p className="text-sm text-gray-500 mt-2">Use the download button to open this file type.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Uploaded By</h3>
                <div className="flex items-start space-x-3">
                  {note.uploader?.profilePicture ? (
                    <img src={`${apiClient.defaults.baseURL.replace('/api', '')}/${note.uploader.profilePicture.replace(/\\/g, '/')}`} alt={note.uploader.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/profile/${note.uploader?._id}`} className="font-medium text-gray-900 hover:text-primary-600 hover:underline line-clamp-1 min-w-0 flex-1">
                        {note.uploader?.username}
                      </Link>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                        {Number(note.uploader?.reputation || 0).toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-semibold shadow-sm ${uploaderStatus.className}`}>
                        {uploaderStatus.label}
                      </span>
                      <p className="text-sm text-gray-600 line-clamp-1">{note.uploader?.department}</p>
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

              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Downloads
                    </span>
                    <span className="font-semibold">{Number(note.downloadCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Views
                    </span>
                    <span className="font-semibold">{Number(note.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful Votes
                    </span>
                    <span className="font-semibold">{Array.isArray(note.votedBy) ? note.votedBy.length : Number(note.helpfulVotes || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => downloadMutation.mutate()}
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
                      Download Note
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Sign in to vote');
                        return;
                      }

                      if (isAuthenticated && user?._id === note.uploader?._id) {
                        toast.error('You cannot vote for your own note.');
                        return;
                      }

                      voteMutation.mutate();
                    }}
                    disabled={voteMutation.isLoading || (isAuthenticated && user?._id === note.uploader?._id)}
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

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Sign in to report this note');
                      return;
                    }
                    setShowReportModal(true);
                  }}
                  className="w-full btn-secondary min-h-touch text-error-600 hover:text-error-700 flex items-center justify-center"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportContentModal
          resourceType="note"
          resourceId={id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default NoteDetails;
