import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import apiClient from '@/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Clock3, Search, X } from 'lucide-react';

const examTypes = [
  { value: 'mid', label: 'Midterm' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
];

const RequestPaper = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('open');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [formData, setFormData] = useState({
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

  const { data, isLoading, isFetching } = useQuery(
    ['paper-requests', statusFilter, page, pageSize],
    async () => {
      const response = await apiClient.get(
        `/requests?status=${statusFilter}&page=${page}&limit=${pageSize}`
      );
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchInterval: 20000,
      refetchIntervalInBackground: true,
    }
  );

  const { data: openRequestsMeta } = useQuery(
    ['paper-requests-open-count'],
    async () => {
      const response = await apiClient.get('/requests?status=open&page=1&limit=1');
      return response.data;
    },
    {
      staleTime: 30000,
    }
  );

  const createMutation = useMutation(
    () => apiClient.post('/requests', formData),
    {
      onSuccess: () => {
        toast.success('Paper request posted');
        setFormData({
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
        setPage(1);
        setIsRequestFormOpen(false);
        queryClient.invalidateQueries('paper-requests');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create request');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to request a paper.');
      return;
    }
    createMutation.mutate();
  };

  const requests = data?.requests || [];

  const filteredRequests = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return requests.filter((req) => {
      const passesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'mine' && user?._id && req.requester?._id === user._id);

      if (!passesVisibility) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        req.courseName,
        req.university,
        req.department,
        req.requester?.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [requests, searchText, user?._id, visibilityFilter]);

  const totalRequests = Number(data?.total || 0);
  const currentPage = Number(data?.currentPage || 1);
  const totalPages = Math.max(1, Number(data?.totalPages || 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-fluid-2xl font-bold text-slate-900">Requested Papers Board</h1>
          <p className="text-fluid-base text-slate-600 mt-2">Post what you need and track when contributors fulfill it.</p>
        </div>

        <div className="card p-4 sm:p-5">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-fluid-lg font-semibold text-slate-900">Request Board</h2>

                <button
                  type="button"
                  className="btn-primary min-h-touch"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please sign in to request a paper.');
                      return;
                    }
                    setIsRequestFormOpen(true);
                  }}
                >
                  Request a Paper
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Clock3 className="h-4 w-4 text-amber-600" />
                <span>
                  Open requests:
                  <span className="ml-1 font-semibold text-slate-900">{Number(openRequestsMeta?.total || 0).toLocaleString()}</span>
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
                <select
                  className="input-field w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="open">Open</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="all">All</option>
                </select>

                <select
                  className="input-field w-full"
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  disabled={!isAuthenticated}
                >
                  <option value="all">All Users</option>
                  <option value="mine">My Requests</option>
                </select>
              </div>

              <div className="mt-3 md:hidden mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Search by course, university, department, or requester"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="hidden md:flex md:items-center gap-1.5 sm:gap-2 mt-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input-field pl-9 w-full"
                    placeholder="Search by course, university, department, or requester"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <select
                  className="input-field w-auto"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="open">Open</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="all">All</option>
                </select>

                <select
                  className="input-field w-auto"
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  disabled={!isAuthenticated}
                >
                  <option value="all">All Users</option>
                  <option value="mine">My Requests</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-slate-600">Loading requests...</div>
            ) : filteredRequests.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredRequests.map((req) => (
                  <div key={req._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50/70 transition-colors duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {req.title?.trim() || `${req.courseName} (${req.examType.toUpperCase()} ${req.year})`}
                        </p>
                        <p className="text-sm text-slate-600">
                          {req.courseName} ({req.examType.toUpperCase()} {req.year})
                        </p>
                        <p className="text-sm text-slate-600">{req.university} • {req.department}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Requested by {req.requester?.username || 'Unknown'} on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3 flex items-end justify-between gap-3">
                      <div className="text-sm min-h-[1.5rem] text-slate-700">
                        {req.status === 'fulfilled' && req.fulfilledByPaper?._id ? (
                          <>
                            Fulfilled paper:{' '}
                            <Link className="text-primary-600 hover:underline" to={`/papers/${req.fulfilledByPaper._id}`}>
                              {req.fulfilledByPaper.title}
                            </Link>
                          </>
                        ) : req.status === 'open' ? (
                          <>
                            Have this paper?{' '}
                            <Link className="text-primary-600 hover:underline" to={`/upload?requestId=${req._id}`}>
                              Upload now to fulfill it
                            </Link>
                          </>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="btn-secondary min-h-touch text-sm whitespace-nowrap"
                        onClick={() => setSelectedRequest(req)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 border border-dashed border-slate-300 rounded-lg p-6 text-center">
                No requests found for the selected filters.
              </div>
            )}

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
                {isFetching && <span className="ml-2 text-slate-400">Updating...</span>}
              </p>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="btn-secondary min-h-touch"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-touch"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            </div>
        </div>
      </div>

      {isRequestFormOpen && (
        <div className="fixed inset-0 z-[75] bg-black/50 px-4 py-6 sm:py-8 overflow-y-auto" onClick={() => setIsRequestFormOpen(false)}>
          <div
            className="max-w-2xl mx-auto card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-fluid-xl font-bold text-slate-900">Request a Paper</h3>
                <p className="text-fluid-sm text-slate-600 mt-1">Submit what you need and contributors can fulfill it.</p>
              </div>
              <button
                type="button"
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 min-h-touch min-w-[44px] flex items-center justify-center"
                onClick={() => setIsRequestFormOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="p-4 sm:p-5 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <input
                className="input-field"
                placeholder="Request Title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe what kind of paper/content you need (optional)"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <input
                  className="input-field"
                  placeholder="University"
                  value={formData.university}
                  onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Course Name"
                  value={formData.courseName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Course Code"
                  value={formData.courseCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, courseCode: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData((prev) => ({ ...prev, teacher: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                />
                <select className="input-field" value={formData.examType} onChange={(e) => setFormData((p) => ({ ...p, examType: e.target.value }))}>
                  {examTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input
                  type="number"
                  className="input-field"
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: Number(e.target.value) || new Date().getFullYear() }))}
                  required
                />
              </div>
              <input
                className="input-field"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              />

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button type="button" className="btn-secondary min-h-touch" onClick={() => setIsRequestFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary min-h-touch" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-[70] bg-black/50 px-4 py-6 sm:py-8 overflow-y-auto" onClick={() => setSelectedRequest(null)}>
          <div
            className="max-w-2xl mx-auto card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-fluid-xl font-bold text-slate-900">{selectedRequest.title?.trim() || 'Requested Paper Details'}</h3>
                <p className="text-fluid-sm text-slate-600 mt-1">Full request information for contributor/admin verification.</p>
              </div>
              <button
                type="button"
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 min-h-touch min-w-[44px] flex items-center justify-center"
                onClick={() => setSelectedRequest(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
              <div>
                <p className="text-slate-500">Course</p>
                <p className="font-semibold text-slate-900">{selectedRequest.courseName}</p>
              </div>
              <div>
                <p className="text-slate-500">Exam Type</p>
                <p className="font-semibold text-slate-900 capitalize">{selectedRequest.examType}</p>
              </div>
              <div>
                <p className="text-slate-500">Year</p>
                <p className="font-semibold text-slate-900">{selectedRequest.year}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-semibold text-slate-900 capitalize">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-slate-500">University</p>
                <p className="font-semibold text-slate-900">{selectedRequest.university}</p>
              </div>
              <div>
                <p className="text-slate-500">Department</p>
                <p className="font-semibold text-slate-900">{selectedRequest.department}</p>
              </div>
              <div>
                <p className="text-slate-500">Requester</p>
                <p className="font-semibold text-slate-900">{selectedRequest.requester?.username || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-500">Requested On</p>
                <p className="font-semibold text-slate-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-slate-500">Description</p>
                <p className="font-medium text-slate-900 whitespace-pre-wrap mt-1">
                  {selectedRequest.description?.trim() || 'No additional description was provided.'}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex justify-end">
              <button type="button" className="btn-secondary min-h-touch" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPaper;
