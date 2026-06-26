import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Shield, Flag, CheckCircle, AlertTriangle, Trash2, Eye } from 'lucide-react';
import apiClient from '@/api/axios';
import toast from 'react-hot-toast';

const ModerationQueue = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['moderation-queue', statusFilter],
    queryFn: async () => {
      const response = await apiClient.get(`/reports/moderation-queue`, {
        params: { status: statusFilter },
      });
      return response.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ reportId, reviewData }) => {
      const response = await apiClient.patch(`/reports/${reportId}/review`, reviewData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report reviewed successfully');
      queryClient.invalidateQueries(['moderation-queue']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to review report');
    },
  });

  const handleReview = (reportId, status, action, adminNotes = '') => {
    reviewMutation.mutate({
      reportId,
      reviewData: { status, action, adminNotes },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          <div className="skeleton h-10 rounded-lg w-1/3 sm:w-1/4"></div>
          <div className="skeleton h-6 rounded w-2/3 sm:w-1/2"></div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-11 w-24 rounded-lg flex-shrink-0"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-48 sm:h-40 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const reports = data?.reports || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-fluid-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
          Moderation Queue
        </h1>
        <p className="mt-2 text-fluid-base text-gray-600">Review and moderate reported papers and notes</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-2">
        {['pending', 'reviewing', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-fluid-sm font-medium transition-colors min-h-touch whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <Flag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-fluid-base text-gray-500">No reports with status: {statusFilter}</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card-interactive p-4 sm:p-6">
              {(() => {
                const content = report.paper || report.note;
                const contentType = report.paper ? 'Paper' : 'Note';

                return (
                  <>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-fluid-base font-semibold text-gray-900 mb-1 line-clamp-2">
                    {content?.title || `${contentType} Deleted`}
                  </h3>
                  <p className="text-fluid-sm text-gray-600">
                    {content?.course} • {content?.university}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-fluid-sm font-medium self-start whitespace-nowrap ${
                    report.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : report.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div>
                  <p className="text-fluid-sm font-medium text-gray-700">Content Type:</p>
                  <p className="text-fluid-sm text-gray-600">{contentType}</p>
                </div>

                <div>
                  <p className="text-fluid-sm font-medium text-gray-700">Reported by:</p>
                  <p className="text-fluid-sm text-gray-600">
                    {report.reporter?.username} ({report.reporter?.email})
                  </p>
                </div>

                <div>
                  <p className="text-fluid-sm font-medium text-gray-700">Reason:</p>
                  <p className="text-fluid-sm text-gray-600">{report.reason.replace(/_/g, ' ')}</p>
                </div>

                <div>
                  <p className="text-fluid-sm font-medium text-gray-700">Description:</p>
                  <p className="text-fluid-sm text-gray-600">{report.description}</p>
                </div>

                {report.adminNotes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-fluid-sm font-medium text-blue-900">Admin Notes:</p>
                    <p className="text-fluid-sm text-blue-800">{report.adminNotes}</p>
                  </div>
                )}

                {report.reviewedBy && (
                  <div className="text-fluid-sm text-gray-500">
                    Reviewed by {report.reviewedBy.username} on {new Date(report.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {report.status === 'pending' && content && (
                <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      const notes = prompt('Enter admin notes (optional):');
                      handleReview(report._id, 'resolved', 'none', notes || '');
                    }}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2 text-fluid-sm min-h-touch"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Dismiss Report
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove this ${contentType.toLowerCase()}?`)) {
                        const notes = prompt('Enter reason for removal:');
                        handleReview(
                          report._id,
                          'resolved',
                          report.paper ? 'paper_removed' : 'note_removed',
                          notes || `${contentType} removed due to violation`
                        );
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 text-fluid-sm min-h-touch"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove {contentType}
                  </button>

                  <a
                    href={report.paper ? `/papers/${report.paper._id}` : `/notes/${report.note._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-fluid-sm min-h-touch sm:flex-initial"
                  >
                    <Eye className="w-4 h-4" />
                    View {contentType}
                  </a>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
