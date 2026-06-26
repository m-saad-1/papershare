import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '@/apiClient';
import { mapBadgeKeys } from '@/utils/badges';
import { StyledBadge } from '@/components/badges/StyledBadge';
import { getContributorStatusMeta } from '@/utils/contributorStatus';

const UniversityCommunity = () => {
  const { universityName } = useParams();
  const decodedUniversity = decodeURIComponent(universityName || '');
  const [filters, setFilters] = useState({ department: '', course: '', semester: '', page: 1 });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.course) params.append('course', filters.course);
    if (filters.semester) params.append('semester', filters.semester);
    params.append('page', String(filters.page));
    params.append('limit', '12');
    return params.toString();
  }, [filters]);

  const { data, isLoading, isError } = useQuery(['university-community', decodedUniversity, queryString], async () => {
    const response = await apiClient.get(`/universities/${encodeURIComponent(decodedUniversity)}/community?${queryString}`);
    return response.data;
  }, {
    enabled: !!decodedUniversity,
    keepPreviousData: true,
  });

  const { data: notesData } = useQuery(['university-notes', decodedUniversity, queryString], async () => {
    const response = await apiClient.get(`/notes?university=${encodeURIComponent(decodedUniversity)}&${queryString}`);
    return response.data;
  }, {
    enabled: !!decodedUniversity,
    keepPreviousData: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-fluid-2xl font-bold text-gray-900">{decodedUniversity}</h1>
        <p className="text-fluid-base text-gray-600 mt-2">Community papers, contributors, and university activity.</p>

        {isLoading ? (
          <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton skeleton-text w-1/2 mb-2" />
                <div className="skeleton skeleton-text w-3/4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="mt-4 sm:mt-6 card p-4 sm:p-6 text-error-600">Failed to load community page.</div>
        ) : (
          <>
            <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="card p-4">
                <p className="text-xs text-gray-500">Total Papers</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats?.totalPapers || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats?.totalNotes || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats?.totalUploads || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Active Contributors</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats?.activeContributors || 0}</p>
              </div>
              <div className="card p-4 col-span-2 lg:col-span-2">
                <p className="text-xs text-gray-500">Top Contributor</p>
                {data?.topContributor ? (
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{data.topContributor.username}</span>
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${getContributorStatusMeta(data.topContributor.contributorStatus).className}`}>
                        {getContributorStatusMeta(data.topContributor.contributorStatus).label}
                      </span>
                      <span className="text-xs text-primary-700">{Number(data.topContributor.points || data.topContributor.reputation || 0).toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                      <span>{Number(data.topContributor.totalUploads || 0).toLocaleString()} uploads</span>
                      <span>{Number(data.topContributor.noteUploads || 0).toLocaleString()} notes</span>
                      <span>{Number(data.topContributor.helpfulVotesReceived || 0).toLocaleString()} votes</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">No contributor data yet.</p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 card p-4 sm:p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <select
                  className="input-field min-h-touch"
                  value={filters.department}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value, page: 1 }))}
                >
                  <option value="">All Departments</option>
                  {(data?.filters?.departments || []).map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select
                  className="input-field min-h-touch"
                  value={filters.course}
                  onChange={(e) => setFilters((prev) => ({ ...prev, course: e.target.value, page: 1 }))}
                >
                  <option value="">All Courses</option>
                  {(data?.filters?.courses || []).map((course) => <option key={course} value={course}>{course}</option>)}
                </select>
                <select
                  className="input-field min-h-touch"
                  value={filters.semester}
                  onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value, page: 1 }))}
                >
                  <option value="">All Semesters</option>
                  {(data?.filters?.semesters || []).map((semester) => <option key={semester} value={semester}>{semester}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(data?.recentUploads || []).map((paper) => (
                <Link key={paper._id} to={`/papers/${paper._id}`} className="card-interactive p-4 sm:p-6">
                  <p className="font-semibold text-gray-900 line-clamp-2">{paper.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{paper.course} - {paper.semester}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{paper.department} - {paper.year}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <span>{paper.downloadCount || 0} downloads</span>
                    <span>{paper.helpfulVotes || 0} helpful</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-gray-700">By {paper.uploader?.username}</span>
                    <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${getContributorStatusMeta(paper.uploader?.contributorStatus).className}`}>
                      {getContributorStatusMeta(paper.uploader?.contributorStatus).label}
                    </span>
                    {mapBadgeKeys(paper.uploader?.badgeKeys || []).slice(0, 1).map((badge) => (
                      <div key={badge.key} className="scale-75 origin-left">
                        <StyledBadge badgeKey={badge.key} size="sm" />
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Study Notes</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(notesData?.notes || []).map((note) => (
                  <div key={note._id} className="card p-4 sm:p-6">
                      <p className="font-semibold text-gray-900 line-clamp-2">{note.title}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{note.course} - {note.semester}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{note.department} - {note.year}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                      <span>{note.downloadCount || 0} downloads</span>
                      <span>{note.helpfulVotes || 0} helpful</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-2 line-clamp-1">By {note.uploader?.username || 'Unknown'}</p>
                  </div>
                ))}
                {(!notesData?.notes || notesData.notes.length === 0) && (
                  <div className="col-span-full card p-4 sm:p-6 text-fluid-base text-gray-600">
                    No notes found for current filters.
                  </div>
                )}
              </div>
            </div>

            {(data?.pagination?.totalPages || 0) > 1 && (
              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2">
                <button
                  className="btn-secondary min-h-touch px-3 py-2 text-sm disabled:opacity-50"
                  disabled={data.pagination.currentPage <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">Page {data.pagination.currentPage} / {data.pagination.totalPages}</span>
                <button
                  className="btn-secondary min-h-touch px-3 py-2 text-sm disabled:opacity-50"
                  disabled={data.pagination.currentPage >= data.pagination.totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UniversityCommunity;
