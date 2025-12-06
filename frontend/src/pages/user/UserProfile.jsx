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

  // In a real app, you'd fetch this data from your backend
  const { data, isLoading, error } = useQuery(['userProfile', userId], async () => {
    // Mocking data since we don't have a backend endpoint
    // const response = await axios.get(`/api/users/${userId}/profile`);
    // return response.data;
    return {
      _id: userId,
      username: 'AlexDoe',
      email: 'alex.doe@example.com',
      university: 'University of Technology',
      department: 'Computer Science',
      createdAt: '2024-01-15T10:00:00.000Z',
      bio: 'Third-year Computer Science student passionate about open-source and collaborative learning. Focused on AI and web development.',
      stats: {
        points: 1250,
        rank: 12,
        uploads: 15,
        downloads: 2300,
        votesReceived: 450,
        views: 8500,
      },
      achievements: [
        { name: 'First Upload', icon: Upload, date: '2024-01-20', description: 'Uploaded your first paper.' },
        { name: 'Prolific Uploader', icon: TrendingUp, date: '2024-03-10', description: 'Uploaded 10+ papers.' },
        { name: 'Community Helper', icon: ThumbsUp, date: '2024-04-05', description: 'Received 100+ helpful votes.' },
        { name: 'Top Contributor', icon: Star, date: '2024-05-01', description: 'Reached the top 10 on the leaderboard.' },
        { name: 'Verified Contributor', icon: ShieldCheck, date: '2024-02-15', description: 'Had 5 papers verified by admins.' },
      ],
      uploadedPapers: Array.from({ length: 6 }, (_, i) => ({
        _id: `paper${i}`,
        title: `Advanced Algorithms Midterm ${2023 - i}`,
        course: 'Advanced Algorithms',
        courseCode: 'CS-401',
        downloadCount: 150 + i * 20,
        helpfulVotes: 30 + i * 5,
      })),
      recentActivity: [
        { type: 'upload', content: 'Uploaded a new paper: "Neural Networks Final"', date: '2024-05-20T10:00:00Z', icon: Upload },
        { type: 'vote', content: 'Voted "Helpful" on "Intro to Quantum Computing"', date: '2024-05-19T15:30:00Z', icon: ThumbsUp },
        { type: 'comment', content: 'Commented on "Data Structures Assignment 3"', date: '2024-05-18T11:00:00Z', icon: MessageSquare },
        { type: 'achievement', content: 'Earned the "Top Contributor" badge', date: '2024-05-01T09:00:00Z', icon: Award },
      ],
      progress: {
        currentLevel: 'Contributor',
        nextLevel: 'Expert',
        pointsToNextLevel: 750,
        currentProgress: 250,
      }
    };
  });

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

  const { username, university, department, createdAt, bio, stats, achievements, uploadedPapers, recentActivity, progress } = data;

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
                #{stats.rank}
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
                <div className="text-4xl font-bold text-primary-600">{stats.points}</div>
                <div className="text-sm font-medium text-gray-600">Contribution Points</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center space-x-2 border-b border-gray-200 pb-2">
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
                    <StatCard icon={Upload} label="Uploads" value={stats.uploads} />
                    <StatCard icon={Download} label="Total Downloads" value={`${(stats.downloads / 1000).toFixed(1)}k`} />
                    <StatCard icon={ThumbsUp} label="Votes Received" value={stats.votesReceived} />
                    <StatCard icon={Eye} label="Paper Views" value={`${(stats.views / 1000).toFixed(1)}k`} />
                    <StatCard icon={Award} label="Achievements" value={achievements.length} />
                    <StatCard icon={TrendingUp} label="Rank" value={`#${stats.rank}`} />
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
                        {progress.pointsToNextLevel - progress.currentProgress} points to reach {progress.nextLevel}
                    </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                            <activity.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{activity.content}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Papers</h2>
              {uploadedPapers.length > 0 ? (
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
                {achievements.map(badge => (
                  <div key={badge.name} className="card p-6 text-center flex flex-col items-center">
                    <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mb-4">
                      <badge.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex-grow">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      Earned on {new Date(badge.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
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