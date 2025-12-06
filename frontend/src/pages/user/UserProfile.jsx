import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  User,
  Building2,
  BookOpen,
  Calendar,
  Award,
  Upload,
  Download,
  ThumbsUp,
  Eye,
  Star,
  ShieldCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  GitCommit
} from 'lucide-react';
import Leaderboard from './Leaderboard';

// This would likely be a shared component
const PaperCard = ({ paper }) => (
    <div className="card group hover:shadow-lg transition-all duration-200">
        <div className="p-6">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-2">
                {paper.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
                {paper.course} • {paper.courseCode}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {paper.downloadCount}
                </span>
                <span className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {paper.helpfulVotes}
                </span>
                <Link to={`/papers/${paper._id}`} className="text-primary-600 hover:text-primary-700 font-medium group-hover:underline">
                    View
                </Link>
            </div>
        </div>
    </div>
);

const UserProfile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, error } = useQuery(['userProfile', userId], async () => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  }, { enabled: !!userId });

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="card p-4 flex items-center">
      <div className="bg-primary-100 text-primary-600 p-3 rounded-lg mr-4">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 font-semibold rounded-md transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) return <div className="text-center p-12">Loading profile...</div>;
  if (error) return <div className="text-center p-12 text-red-500">Failed to load profile.</div>;

  const { 
    username, 
    university, 
    department, 
    createdAt, 
    bio, 
    totalUploads = 0,
    totalDownloads = 0,
    totalViews = 0,
    totalHelpfulVotes = 0,
    points = 0,
    rank = 'N/A',
    achievements = [], 
    uploadedPapers = [], 
    recentActivity = [], 
    progress = { currentLevel: 'N/A', nextLevel: 'N/A', currentProgress: 0, pointsToNextLevel: 1 } 
  } = data || {};

  const stats = {
    rank,
    points,
    uploads: totalUploads,
    downloads: totalDownloads,
    votesReceived: totalHelpfulVotes,
    views: totalViews,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mb-4 md:mb-0">
                <User className="h-16 w-16 text-primary-600" />
              </div>
              <span className="absolute bottom-0 right-2 bg-green-500 text-white rounded-full p-1 text-xs font-bold">
                #{stats?.rank || 'N/A'}
              </span>
            </div>
            <div className="md:ml-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-gray-600 mt-2">
                <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" /> {university}</span>
                <span className="flex items-center"><BookOpen className="h-4 w-4 mr-1" /> {department}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Joined {new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-4 text-gray-700 max-w-xl">{bio}</p>
            </div>
            <div className="md:ml-auto mt-6 md:mt-0 text-center">
                <div className="text-4xl font-bold text-primary-600">{stats?.points || 0}</div>
                <div className="text-sm font-medium text-gray-600">Contribution Points</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
          <TabButton tabName="overview" label="Overview" />
          <TabButton tabName="uploads" label={`Uploads (${uploadedPapers.length})`} />
          <TabButton tabName="achievements" label={`Achievements (${achievements.length})`} />
          <TabButton tabName="leaderboard" label="Leaderboard" />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <StatCard icon={Upload} label="Uploads" value={stats?.uploads || 0} />
                    <StatCard icon={Download} label="Total Downloads" value={`${((stats?.downloads || 0) / 1000).toFixed(1)}k`} />
                    <StatCard icon={ThumbsUp} label="Votes Received" value={stats?.votesReceived || 0} />
                    <StatCard icon={Eye} label="Paper Views" value={`${((stats?.views || 0) / 1000).toFixed(1)}k`} />
                    <StatCard icon={Award} label="Achievements" value={achievements?.length || 0} />
                    <StatCard icon={TrendingUp} label="Rank" value={`#${stats?.rank || 'N/A'}`} />
                </div>

                {/* Progress */}
                <div className="card p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Progression</h3>
                    <div className="flex justify-between items-center text-sm font-medium mb-2">
                        <span className="text-gray-700">{progress.currentLevel}</span>
                        <span className="text-primary-600">{progress.nextLevel}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                            className="bg-primary-600 h-4 rounded-full" 
                            style={{ width: `${(progress.currentProgress / progress.pointsToNextLevel) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                        {(progress.pointsToNextLevel - progress.currentProgress) > 0 ? `${progress.pointsToNextLevel - progress.currentProgress} points to reach ${progress.nextLevel}` : 'Max level reached!'}
                    </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <ul className="space-y-4">
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => {
                        const Icon = { upload: Upload, vote: ThumbsUp, comment: MessageSquare, achievement: Award }[activity.type] || GitCommit;
                        return (
                          <li key={index} className="flex items-start">
                            <div className="bg-gray-100 rounded-full p-2 mr-3">
                                <Icon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-800">{activity.content}</p>
                              <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                            </div>
                          </li>
                        );
                      })
                    ) : <p className="text-sm text-gray-500">No recent activity.</p>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Papers</h2>
              {uploadedPapers && uploadedPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedPapers.map(paper => (
                    <PaperCard key={paper._id} paper={paper} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Papers Uploaded</h3>
                  <p className="text-gray-600">This user hasn't uploaded any papers yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements & Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {achievements && achievements.length > 0 ? (
                  achievements.map(badge => {
                    const Icon = { 'First Upload': Upload, 'Prolific Uploader': TrendingUp, 'Community Helper': ThumbsUp, 'Top Contributor': Star, 'Verified Contributor': ShieldCheck }[badge.name] || Award;
                    return (
                      <div key={badge.name} className="card p-6 text-center flex flex-col items-center">
                        <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mb-4">
                          <Icon className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 flex-grow">{badge.description}</p>
                        <p className="text-xs text-gray-500 mt-3">Earned on {new Date(badge.date).toLocaleDateString()}</p>
                      </div>
                    );
                  })
                ) : <p className="text-sm text-gray-500 col-span-full text-center">No achievements yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard currentUser={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;