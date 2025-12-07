import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios'; // Assuming you have a configured axios instance
import { FaUserCircle, FaFileAlt, FaCalendarAlt, FaDownload, FaEye, FaThumbsUp, FaGraduationCap, FaBook, FaTags, FaCalendarDay } from 'react-icons/fa';
import toast from 'react-hot-toast';

const fetchUser = async (userId) => {
  const { data } = await axios.get(`/users/${userId}`);
  return data;
};

const fetchUserPapers = async (userId) => {
  const { data } = await axios.get(`/papers/user/${userId}`);
  return data;
};

// Reusable StatCard component for clean display
const StatCard = ({ value, label, icon }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-200">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-3xl font-extrabold text-indigo-600">{value}</p>
    <p className="text-sm text-gray-500 uppercase tracking-wider">{label}</p>
  </div>
);


const UserProfile = () => {
  const { userId } = useParams();

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
    () => fetchUserPapers(userId),
    {
      enabled: !!userId,
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Could not fetch user papers.');
      }
    }
  );

  if (isUserLoading || arePapersLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (isUserError) {
    return <div className="text-center p-10 text-red-500">{userError.response?.data?.message || 'Error loading user.'}</div>;
  }

  // Calculate stats from papers
  const totalPapers = papers ? papers.length : 0;
  const totalDownloads = papers ? papers.reduce((sum, paper) => sum + paper.downloadCount, 0) : 0;
  const totalViews = papers ? papers.reduce((sum, paper) => sum + paper.views, 0) : 0;
  const totalHelpfulVotes = papers ? papers.reduce((sum, paper) => sum + paper.helpfulVotes, 0) : 0;


  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
          <FaUserCircle className="text-7xl sm:text-8xl flex-shrink-0" />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{user?.name}</h1>
            <p className="text-indigo-200 text-lg">{user?.email}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <StatCard value={totalPapers} label="Papers Uploaded" icon={<FaFileAlt className="text-blue-500" />} />
          <StatCard value={totalDownloads} label="Total Downloads" icon={<FaDownload className="text-green-500" />} />
          <StatCard value={totalViews} label="Total Views" icon={<FaEye className="text-purple-500" />} />
          <StatCard value={totalHelpfulVotes} label="Helpful Votes" icon={<FaThumbsUp className="text-teal-500" />} />
        </div>

        {/* Published Papers Section */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-indigo-500 pb-2">Published Papers</h2>
          {arePapersError && <p className="text-red-500 text-center py-4">{papersError.response?.data?.message || 'Could not load papers.'}</p>}
          {papers && papers.length > 0 ? (
            <div className="space-y-6">
              {papers.map((paper) => (
                <div key={paper._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <Link to={`/papers/${paper._id}`} className="text-xl font-semibold text-indigo-700 hover:text-indigo-900 leading-tight">
                      {paper.title}
                    </Link>
                    <div className="text-sm text-gray-500 flex items-center space-x-2 mt-2 sm:mt-0 flex-shrink-0">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{paper.description}</p>

                  <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2 gap-x-4 mb-4">
                    {paper.university && <span className="flex items-center"><FaGraduationCap className="mr-1 text-gray-400" />{paper.university}</span>}
                    {paper.course && <span className="flex items-center"><FaBook className="mr-1 text-gray-400" />{paper.course} ({paper.courseCode})</span>}
                    {paper.paperType && <span className="flex items-center"><FaTags className="mr-1 text-gray-400" />{paper.paperType}</span>}
                    {paper.semester && <span className="flex items-center"><FaCalendarDay className="mr-1 text-gray-400" />{paper.semester} {paper.year}</span>}
                  </div>

                  <div className="flex items-center text-sm text-gray-700 space-x-4 pt-3 border-t border-gray-100">
                    <span className="flex items-center"><FaDownload className="mr-1 text-blue-500" />{paper.downloadCount} Downloads</span>
                    <span className="flex items-center"><FaEye className="mr-1 text-purple-500" />{paper.views} Views</span>
                    <span className="flex items-center"><FaThumbsUp className="mr-1 text-teal-500" />{paper.helpfulVotes} Votes</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">This user has not published any papers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;