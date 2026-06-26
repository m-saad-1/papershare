import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Crown, Medal, Trophy, Filter, Building2, GraduationCap, Upload, Download, ThumbsUp, Star, Zap } from 'lucide-react';
import apiClient from '@/apiClient';
import { getContributorStatusMeta } from '@/utils/contributorStatus';

const scopes = [
  { value: 'global', label: 'Global' },
  { value: 'university', label: 'University' },
  { value: 'department', label: 'Department' },
];

const Leaderboard = () => {
  const [scope, setScope] = useState('global');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      scope,
    });

    if (university.trim()) params.append('university', university.trim());
    if (department.trim()) params.append('department', department.trim());
    return params.toString();
  }, [page, limit, scope, university, department]);

  const { data, isLoading, isError } = useQuery(
    ['leaderboard-page', queryString],
    async () => {
      const response = await apiClient.get(`/users/leaderboard?${queryString}`);
      return response.data;
    },
    { keepPreviousData: true }
  );

  const users = data?.users || [];

  const { data: profileMetricsByUser = {}, isLoading: isLoadingProfiles, isError: isProfilesError } = useQuery(
    ['leaderboard-profile-metrics', users.map((user) => user._id).join('|')],
    async () => {
      const profiles = await Promise.all(
        users.map(async (user) => {
          const response = await apiClient.get(`/users/${user._id}/public`);
          return [user._id, response.data];
        })
      );

      return Object.fromEntries(profiles);
    },
    {
      enabled: users.length > 0,
      keepPreviousData: true,
    }
  );

  const leaderboardUsers = useMemo(() => {
    const hydratedUsers = users.map((user) => {
      const profileData = profileMetricsByUser[user._id];
      const profileUser = profileData?.user || {};
      const profileMetrics = profileData?.metrics || {};

      return {
        ...user,
        username: profileUser.username || user.username,
        university: profileUser.university || user.university,
        department: profileUser.department || user.department,
        contributorStatus: profileUser.contributorStatus || user.contributorStatus,
        profilePicture: profileUser.profilePicture || user.profilePicture,
        badgeKeys: profileUser.badgeKeys || user.badgeKeys || [],
        points: Number(profileMetrics.points ?? profileUser.reputation ?? user.points ?? user.reputation ?? 0),
        helpfulVotesReceived: Number(profileMetrics.helpfulVotesReceived ?? user.helpfulVotesReceived ?? user.votesReceived ?? 0),
        votesReceived: Number(profileMetrics.helpfulVotesReceived ?? user.votesReceived ?? user.helpfulVotesReceived ?? 0),
        totalUploads: Number(profileMetrics.totalUploads ?? user.totalUploads ?? user.uploadCount ?? 0),
        downloadsGenerated: Number(profileMetrics.downloadsGenerated ?? user.downloadsGenerated ?? 0),
      };
    });

    hydratedUsers.sort((leftUser, rightUser) => {
      const leftAmbassador = leftUser.contributorStatus === 'Campus Ambassador' ? 1 : 0;
      const rightAmbassador = rightUser.contributorStatus === 'Campus Ambassador' ? 1 : 0;

      if (rightAmbassador !== leftAmbassador) return rightAmbassador - leftAmbassador;
      if (rightUser.points !== leftUser.points) return rightUser.points - leftUser.points;
      if (rightUser.helpfulVotesReceived !== leftUser.helpfulVotesReceived) return rightUser.helpfulVotesReceived - leftUser.helpfulVotesReceived;
      if (rightUser.totalUploads !== leftUser.totalUploads) return rightUser.totalUploads - leftUser.totalUploads;
      if (rightUser.downloadsGenerated !== leftUser.downloadsGenerated) return rightUser.downloadsGenerated - leftUser.downloadsGenerated;

      return String(leftUser.username || '').localeCompare(String(rightUser.username || ''));
    });

    return hydratedUsers.map((user, index) => ({
      ...user,
      rank: ((page - 1) * limit) + index + 1,
    }));
  }, [users, profileMetricsByUser, page, limit]);

  const getVoteCount = (user) => {
    const toValidNumber = (value) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? Math.max(0, numericValue) : null;
    };

    const voteCandidates = [
      toValidNumber(user?.helpfulVotesReceived),
      toValidNumber(user?.votesReceived),
      toValidNumber(user?.helpfulVotes),
      toValidNumber(user?.totalVotes),
      toValidNumber(user?.metrics?.helpfulVotesReceived),
      Array.isArray(user?.votedBy) ? user.votedBy.length : null,
    ].filter((value) => value !== null);

    return voteCandidates.length > 0 ? Math.max(...voteCandidates) : 0;
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
    if (rank === 3) return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />;
    return null;
  };

  const badgeIconMap = {
    first_upload: Star,
    contributor: Zap,
    department_hero: Medal,
    exam_saver: Trophy,
    knowledge_king: Crown,
    study_guide: Trophy,
  };

  const SkeletonCard = () => (
    <div className="card p-4">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-12 sm:items-center">
        <div className="sm:col-span-1">
          <div className="skeleton h-6 w-12 rounded" />
        </div>
        <div className="sm:col-span-4 flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-text h-4 w-3/4" />
            <div className="skeleton-text h-3 w-1/2" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="skeleton-text h-4 w-16" />
        </div>
        <div className="sm:col-span-1">
          <div className="skeleton-text h-4 w-10" />
        </div>
        <div className="sm:col-span-2">
          <div className="skeleton-text h-4 w-12" />
        </div>
        <div className="sm:col-span-2">
          <div className="skeleton-text h-4 w-14" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-fluid-2xl sm:text-fluid-3xl font-bold text-gray-900">Contributor Leaderboard</h1>
          <p className="text-fluid-sm sm:text-fluid-base text-gray-600 mt-2">Rankings by points, votes, uploads, and downloads from live contributor activity.</p>
        </div>

        {/* Filters Card */}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium text-fluid-base">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" /> Filters
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-fluid-sm text-gray-600 mb-1">Leaderboard Scope</label>
              <select
                className="input-field min-h-touch sm:min-h-0"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setPage(1);
                }}
              >
                {scopes.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-fluid-sm text-gray-600 mb-1 flex items-center gap-1">
                <Building2 className="h-4 w-4" /> University
              </label>
              <input
                type="text"
                className="input-field min-h-touch sm:min-h-0"
                placeholder="Enter university name"
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  setPage(1);
                }}
                disabled={scope === 'global'}
              />
            </div>

            <div className="xs:col-span-2 sm:col-span-1">
              <label className="block text-fluid-sm text-gray-600 mb-1 flex items-center gap-1">
                <GraduationCap className="h-4 w-4" /> Department
              </label>
              <input
                type="text"
                className="input-field min-h-touch sm:min-h-0"
                placeholder="Enter department name"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                disabled={scope !== 'department'}
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="card overflow-hidden">
          {isLoading || (users.length > 0 && isLoadingProfiles) ? (
            <div className="p-4 sm:p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError || isProfilesError ? (
            <div className="p-6 sm:p-8 text-center text-fluid-base text-red-600">Failed to load leaderboard.</div>
          ) : leaderboardUsers.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-fluid-base text-gray-600">No contributors found for the selected filters.</div>
          ) : (
            <>
              {/* Desktop Header - Hidden on mobile */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 text-fluid-xs font-semibold text-gray-600 uppercase tracking-wide">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">User</div>
                <div className="col-span-2">Points</div>
                <div className="col-span-1">Votes</div>
                <div className="col-span-2">Uploads</div>
                <div className="col-span-2">Downloads</div>
              </div>

              {/* Leaderboard Entries */}
              <div className="divide-y divide-gray-100">
                {leaderboardUsers.map((u) => (
                  <div
                    key={u._id}
                    className="card-interactive flex flex-col gap-3 p-4 sm:p-4 sm:grid sm:grid-cols-12 sm:items-center sm:gap-6 border-0 rounded-none"
                  >
                    {/* Mobile: Card Header with Rank */}
                    <div className="flex items-center justify-between sm:contents">
                      {/* Rank */}
                      <div className="sm:col-span-1 flex items-center gap-2 font-semibold text-fluid-lg sm:text-fluid-base text-gray-800">
                        #{u.rank}
                        {rankIcon(u.rank)}
                      </div>

                      {/* Mobile: Points Badge */}
                      <div className="sm:hidden text-fluid-sm font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-full">
                        {Number(u.points || 0).toLocaleString()} pts
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="sm:col-span-4 flex items-center gap-3">
                      {u.profilePicture ? (
                        <img
                          src={`${apiClient.defaults.baseURL.replace('/api', '')}/${u.profilePicture.replace(/\\/g, '/')}`}
                          alt={u.username}
                          className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-fluid-base sm:text-fluid-sm flex-shrink-0">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/profile/${u._id}`}
                            className="font-semibold text-fluid-base sm:text-fluid-sm text-gray-900 hover:text-primary-600 line-clamp-1"
                            title={u.username}
                          >
                            {u.username}
                          </Link>
                          <span className={`px-1.5 py-0.5 rounded-full border text-fluid-xs ${getContributorStatusMeta(u.contributorStatus).className}`}>
                            {getContributorStatusMeta(u.contributorStatus).label}
                          </span>
                          <div className="flex items-center gap-1">
                            {(u.badgeKeys || []).map((badgeKey) => {
                              const Icon = badgeIconMap[badgeKey];
                              if (!Icon) return null;

                              return (
                                <Icon
                                  key={badgeKey}
                                  className="h-4 w-4 text-primary-600"
                                  title={badgeKey.replace(/_/g, ' ')}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-fluid-xs text-gray-500 line-clamp-1">{u.university} {u.department ? `• ${u.department}` : ''}</p>
                      </div>
                    </div>

                    {/* Mobile: Stats Grid */}
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:contents">
                      {/* Points - Hidden on mobile (shown in header) */}
                      <div className="hidden sm:flex sm:col-span-2 text-fluid-sm font-bold text-primary-700">
                        {Number(u.points || 0).toLocaleString()} pts
                      </div>

                      {/* Votes */}
                      <div className="flex items-center gap-1.5 sm:col-span-1 text-fluid-sm text-gray-700 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <ThumbsUp className="h-4 w-4 text-amber-600" />
                        <span className="sm:hidden text-fluid-xs text-gray-500">Votes:</span>
                        <span className="font-medium">{getVoteCount(u).toLocaleString()}</span>
                      </div>

                      {/* Uploads */}
                      <div className="flex items-center gap-1.5 sm:col-span-2 text-fluid-sm text-gray-700 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <span className="sm:hidden text-fluid-xs text-gray-500">Uploads:</span>
                        <span className="font-medium">{Number((u.totalUploads ?? u.uploadCount) || 0).toLocaleString()}</span>
                      </div>

                      {/* Downloads */}
                      <div className="flex items-center gap-1.5 sm:col-span-2 text-fluid-sm text-gray-700 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <Download className="h-4 w-4 text-green-600" />
                        <span className="sm:hidden text-fluid-xs text-gray-500">Downloads:</span>
                        <span className="font-medium">{Number(u.downloadsGenerated || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {(data?.totalPages || 0) > 1 && (
          <div className="flex flex-col xs:flex-row items-center justify-center mt-4 sm:mt-6 gap-2 sm:gap-4">
            <button
              className="w-full xs:w-auto min-h-touch sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg border border-gray-300 text-fluid-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              disabled={data.currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="px-3 py-2 text-fluid-sm text-gray-700 order-first xs:order-none">
              Page {data.currentPage} of {data.totalPages}
            </span>
            <button
              className="w-full xs:w-auto min-h-touch sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg border border-gray-300 text-fluid-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              disabled={data.currentPage >= data.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
