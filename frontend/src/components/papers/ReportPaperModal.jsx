import React, { useState, useEffect } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import apiClient from '@/api/axios';
import toast from 'react-hot-toast';

const ReportPaperModal = ({ paperId, onClose }) => {
  const [reason, setReason] = useState('incorrect_content');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const reportMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/reports', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report submitted successfully. Our team will review it.');
      queryClient.invalidateQueries(['my-reports']);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    reportMutation.mutate({
      paperId,
      reason,
      description: description.trim(),
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content modal-md">
        {/* Mobile drag handle */}
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Report Paper</h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch flex items-center justify-center -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Please only report papers that violate our guidelines. False reports may affect your account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
              >
                <option value="incorrect_content">Incorrect Content</option>
                <option value="duplicate">Duplicate Paper</option>
                <option value="copyright">Copyright Violation</option>
                <option value="broken_file">Broken/Corrupted File</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[120px] resize-y"
                rows="4"
                placeholder="Please provide details about why you're reporting this paper..."
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending}
                className="btn-danger w-full sm:w-auto justify-center"
              >
                {reportMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPaperModal;
