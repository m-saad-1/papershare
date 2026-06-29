import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '../../apiClient';
import { FaUserCircle, FaFileAlt, FaDownload, FaEye, FaThumbsUp, FaGraduationCap, FaBook, FaTags, FaCalendarDay, FaCommentDots, FaUniversity, FaCalendar, FaChartBar, FaShareAlt } from 'react-icons/fa';
import { FiUser, FiMail, FiCalendar, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { mapBadgeKeys } from '@/utils/badges';
import { StyledBadge } from '@/components/badges/StyledBadge';
import UserAvatar from '@/components/ui/UserAvatar.jsx';

const fetchUser = async (userId) => {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data;
};

const fetchPublicContributorProfile = async (userId) => {
  const { data } = await apiClient.get(`/users/${userId}/public`);
  return data;
};

const fetchUserPapers = async (userId, isOwnProfile) => {
  let url = `/papers/user/${userId}`;
  if (!isOwnProfile) {
    url += `?visibility=public`;
  }
  const { data } = await apiClient.get(url);
  return data;
};

const UserProfile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser?._id === userId;

  const { data: user, isLoading: isUserLoading, isError: isUserError, error: userError } = useQuery(
    ['user', userId],
    () => fetchUser(userId),
    {
      enabled: !!userId,
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Could not fetch user details.');
      }
    }
  );

  const { data: papers, isLoading: arePapersLoading, isError: arePapersError, error: papersError } = useQuery(
    ['userPapers', userId],
    () => fetchUserPapers(userId, isOwnProfile),
    {
      enabled: !!userId,
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Could not fetch user papers.');
      }
    }
  );

  const { data: publicContributorProfile } = useQuery(
    ['publicContributorProfile', userId],
    () => fetchPublicContributorProfile(userId),
    {
      enabled: !!userId,
    }
  );

  if (isUserLoading || arePapersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fluid-base text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">:(</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-fluid-base text-gray-600">{userError.response?.data?.message || 'Please try again later.'}</p>
        </div>
      </div>
    );
  }

  // Calculate stats from papers
  const totalPapers = publicContributorProfile?.metrics?.totalUploads ?? (papers ? papers.length : 0);
  const totalDownloads = publicContributorProfile?.metrics?.downloadsGenerated ?? (papers ? papers.reduce((sum, paper) => sum + paper.downloadCount, 0) : 0);
  const totalViews = papers ? papers.reduce((sum, paper) => sum + paper.views, 0) : 0;
  const totalHelpfulVotes = publicContributorProfile?.metrics?.helpfulVotesReceived ?? (papers ? papers.reduce((sum, paper) => sum + paper.helpfulVotes, 0) : 0);

  const handleMessageUser = () => {
    navigate(`/messages/${userId}`);
  };

  const stats = [
    { label: 'Reputation', value: Number(user?.reputation || 0), icon: FaChartBar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Papers Uploaded', value: totalPapers, icon: FaFileAlt, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Downloads', value: totalDownloads, icon: FaDownload, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Views', value: totalViews, icon: FaEye, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Helpful Votes', value: totalHelpfulVotes, icon: FaThumbsUp, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const userInfo = [
    { label: 'University', value: user?.university, icon: FaUniversity },
    { label: 'Department', value: user?.department, icon: FaGraduationCap },
    { label: 'Semester', value: user?.semester || 'N/A', icon: FaCalendarDay },
    { label: 'Batch', value: user?.batch || 'N/A', icon: FiCalendar },
    { label: 'Status', value: publicContributorProfile?.user?.contributorStatus || user?.contributorStatus || 'Student', icon: FaUserCircle },
  ];

  const badgeKeys = mapBadgeKeys(user?.badgeKeys || []).map((badge) => badge.key);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header (for scroll position) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm md:hidden px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="min-h-touch min-w-[44px] flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <div className="w-[44px]"></div> {/* Spacer for balance */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Profile Header */}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <UserAvatar user={user} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* User Info */}
                <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-1.5">
                  <h1 className="text-fluid-2xl font-bold text-gray-900">
                    {user?.username}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                    {Number(user?.reputation || 0).toLocaleString()} pts
                  </span>
                </div>
                <p className="text-sm sm:text-fluid-base text-gray-600 mb-1.5">{user?.email}</p>
                {publicContributorProfile?.user?.rank && (
                  <div className="text-xs text-primary-700">
                    Rank #{publicContributorProfile.user.rank} | Top {Number(publicContributorProfile.user.rankPercentile || 0).toFixed(2)} percentile
                  </div>
                )}
              </div>
            </div>

              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {userInfo.map((info, idx) => (
                  info.value && (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700 leading-4">
                      <info.icon className="w-3 h-3 mr-1" />
                      {info.value}
                    </span>
                  )
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/dashboard', { state: { activeTab: 'settings' } })}
                  className="btn-secondary min-h-touch flex-1 md:flex-none inline-flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMessageUser}
                    className="btn-primary min-h-touch flex-1 md:flex-none inline-flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3"
                  >
                    <FaCommentDots className="mr-2 h-4 w-4" />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {user?.bio && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">About</h3>
              <p className="text-fluid-base text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {badgeKeys.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badgeKeys.map((badgeKey) => (
                  <div key={badgeKey} className="origin-left">
                    <StyledBadge badgeKey={badgeKey} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unified Stats Container */}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaChartBar className="text-primary-600" />
              Contribution Stats
            </h2>
            <span className="text-xs text-gray-500">Updated just now</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bg} rounded-lg p-2.5 sm:p-3 border border-gray-100 hover:border-gray-200 transition-colors`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${stat.bg.replace('50', '100')}`}>
                    <stat.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${stat.color}`} />
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] sm:text-xs text-gray-500 leading-4">
                  {stat.label === 'Reputation' && 'Total earned points'}
                  {stat.label === 'Papers Uploaded' && 'Total papers shared'}
                  {stat.label === 'Total Downloads' && 'By other students'}
                  {stat.label === 'Total Views' && 'Paper views'}
                  {stat.label === 'Helpful Votes' && 'Positive feedback'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area with Tab Navigation and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Column: Tab Content and Quick Stats */}
          <div className="lg:col-span-3">
            {/* Tab Navigation with Quick Stats next to it */}
            <div className="mb-4 sm:mb-6">
              <div className="card overflow-hidden flex-1">
                <div className="flex overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`min-h-touch flex-1 min-w-max px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium text-center ${
                      activeTab === 'stats'
                        ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('uploads')}
                    className={`min-h-touch flex-1 min-w-max px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium text-center ${
                      activeTab === 'uploads'
                        ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Papers ({totalPapers})
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'stats' && (
              <div className="card p-4 sm:p-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Activity Summary</h3>

                {/* Quick Stats Container */}
                <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3.5 mb-4 sm:mb-6 border border-gray-200">
                  <div className="grid grid-cols-3 divide-x divide-gray-200">
                    <div className="text-center px-2">
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1">Most Popular</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                        {papers && papers.length > 0
                          ? papers.reduce((prev, current) => (prev.downloadCount > current.downloadCount) ? prev : current).title
                          : 'No papers'}
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1">Last Upload</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {papers && papers.length > 0
                          ? new Date(papers[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'Never'}
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1">Engagement</div>
                      <div className="text-xs sm:text-sm font-medium text-green-600">
                        {totalPapers > 0 && totalDownloads > 0 ? Math.round((totalHelpfulVotes / totalDownloads) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Highlights */}
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3 sm:mb-4">Recent Highlights</h4>
                  <div className="space-y-3">
                    {papers && papers.slice(0, 3).map((paper, index) => (
                      <div key={paper._id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} mr-3`}>
                          <FaFileAlt className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 line-clamp-1">{paper.title}</h5>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="flex items-center mr-3">
                              <FaDownload className="h-3 w-3 mr-1" />
                              {paper.downloadCount}
                            </span>
                            <span className="flex items-center">
                              <FaThumbsUp className="h-3 w-3 mr-1" />
                              {paper.helpfulVotes || 0}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/papers/${paper._id}`}
                          className="btn-secondary min-h-touch ml-2 text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'uploads' && (
              <div className="card overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Published Papers ({totalPapers})</h3>
                  <p className="text-fluid-base text-gray-600 mt-1">All papers uploaded by {user?.username}</p>
                </div>

                {arePapersError && (
                  <div className="p-4 sm:p-6 text-center">
                    <p className="text-error-500 text-sm">{papersError.response?.data?.message || 'Could not load papers.'}</p>
                  </div>
                )}

                {papers && papers.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    <div className="space-y-4 p-4 sm:p-6">
                      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                        {papers.map((paper) => (
                          <Link key={paper._id} to={`/papers/${paper._id}`} className="card-interactive p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-4 line-clamp-2">
                                {paper.title}
                              </h3>
                              <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-full whitespace-nowrap">
                                {paper.paperType}
                              </span>
                            </div>
                            {paper.teacher && (
                              <p className="text-xs text-gray-500 mt-2">
                                Teacher: {paper.teacher}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                              {paper.course}
                              {paper.courseCode && ` - ${paper.courseCode}`}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                              <span className="line-clamp-1 pr-2">{paper.university}</span>
                              <span className="line-clamp-1">{paper.department}</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <FaDownload className="h-4 w-4 mr-1.5" />
                                  {paper.downloadCount}
                                </span>
                                <span className="flex items-center">
                                  <FaThumbsUp className="h-4 w-4 mr-1.5" />
                                  <span>{paper.helpfulVotes || 0}</span>
                                </span>
                                <span className="flex items-center">
                                  <FaEye className="h-4 w-4 mr-1.5" />
                                  {paper.views || 0}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-primary-600 hover:text-primary-700 font-medium text-xs group-hover:underline">
                                  View Details
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                      <FaFileAlt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No papers published yet</h4>
                    <p className="text-fluid-base text-gray-600 max-w-md mx-auto">
                      {user?.username} hasn't uploaded any papers to the platform yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Profile Stats */}
          <div className="lg:col-span-1">
            <div className="card p-4 sm:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="text-primary-600" />
                Profile Stats
              </h3>

              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600">{totalPapers}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Papers</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">{totalDownloads}</div>
                    <div className="text-xs text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">{totalViews}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {isOwnProfile ? (
                      <button
                        onClick={() => navigate('/dashboard', { state: { activeTab: 'settings' } })}
                        className="btn-secondary min-h-touch w-full flex items-center justify-center gap-2"
                      >
                        <FiEdit />
                        Edit Your Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleMessageUser}
                          className="btn-primary min-h-touch w-full flex items-center justify-center gap-2"
                        >
                          <FaCommentDots />
                          Send Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
