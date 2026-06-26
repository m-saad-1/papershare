import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, Download, Eye, ThumbsUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/api/axios';

const TrendingPapers = () => {
  const [timeWindow, setTimeWindow] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['trending-papers', timeWindow],
    queryFn: async () => {
      const response = await apiClient.get(`/trending`, {
        params: { daysWindow: timeWindow, limit: 20 },
      });
      return response.data;
    },
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-papers'],
    queryFn: async () => {
      const response = await apiClient.get(`/trending/popular`, {
        params: { limit: 10 },
      });
      return response.data;
    },
  });

  if (isLoading || popularLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          <div className="skeleton skeleton-text w-1/4 h-8"></div>
          <div className="grid gap-4 sm:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 sm:p-6">
                <div className="skeleton skeleton-text w-3/4 mb-2" />
                <div className="skeleton skeleton-text w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const trending = data?.trending || [];
  const popular = popularData?.popular || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-fluid-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
          Trending & Popular Papers
        </h1>
        <p className="mt-2 text-fluid-base text-gray-600">
          Discover the most popular past papers based on recent activity and downloads
        </p>
      </div>

      {/* Trending Papers Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            Trending Now
          </h2>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="input-field min-h-touch w-full sm:w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {trending.length === 0 ? (
          <div className="text-center py-8 sm:py-12 card">
            <p className="text-fluid-base text-gray-500">No trending papers found for this period</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {trending.map((paper, index) => (
              <Link
                key={paper._id}
                to={`/papers/${paper._id}`}
                className="card-interactive p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{paper.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {paper.course} ({paper.courseCode}) - {paper.university}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {paper.downloadCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {paper.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {paper.helpfulVotes || 0}
                      </span>
                    </div>
                  </div>
                  {paper.uploader && (
                    <div className="sm:ml-4">
                      <Link
                        to={`/profile/${paper.uploader._id}`}
                        className="text-sm text-gray-600 hover:text-primary-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        by <span className="font-medium">{paper.uploader.username}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* All-Time Popular Papers */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          All-Time Popular
        </h2>

        {popular.length === 0 ? (
          <div className="text-center py-8 sm:py-12 card">
            <p className="text-fluid-base text-gray-500">No popular papers found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {popular.map((paper, index) => (
              <Link
                key={paper._id}
                to={`/papers/${paper._id}`}
                className="card-interactive p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-sm font-semibold text-primary-600 shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{paper.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {paper.course} - {paper.university} - {paper.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {paper.downloadCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {paper.helpfulVotes || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPapers;
