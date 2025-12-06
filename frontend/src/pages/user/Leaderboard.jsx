import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Crown, User, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard = ({ currentUser }) => {
  const { data: leaderboardData, isLoading } = useQuery('leaderboard', async () => {
    const response = await axios.get('/users/leaderboard?limit=20');
    return response.data;
  });

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
        Top Contributors
      </h2>

      {isLoading ? (
        <div>Loading leaderboard...</div>
      ) : (
        <div className="space-y-3">
          {leaderboardData?.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                currentUser?._id === user._id
                  ? 'bg-primary-50 border-2 border-primary-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 text-xl font-bold ${getRankColor(user.rank)}`}>
                #{user.rank}
              </div>
              <div className="flex items-center flex-1 ml-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  {user.rank === 1 ? (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-primary-600">
                  {user.username}
                </Link>
              </div>
              <div className="text-lg font-bold text-primary-600">
                {user.points.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;