import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '@/apiClient';

const Universities = () => {
  const { data, isLoading, isError } = useQuery('universities-list', async () => {
    const response = await apiClient.get('/universities');
    return response.data?.universities || [];
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-fluid-2xl font-bold text-gray-900 mb-2">University Communities</h1>
        <p className="text-fluid-base text-gray-600 mb-4 sm:mb-6">Explore papers and contributors by university.</p>

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 sm:p-6">
                <div className="skeleton skeleton-text w-3/4 mb-2" />
                <div className="skeleton skeleton-text w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="card p-4 sm:p-6 text-error-600">Failed to load universities.</div>
        ) : data?.length ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.map((uni) => (
              <Link
                key={uni}
                to={`/universities/${encodeURIComponent(uni)}`}
                className="card-interactive p-4 sm:p-6"
              >
                <p className="font-semibold text-gray-900 line-clamp-2">{uni}</p>
                <p className="text-sm text-primary-600 mt-1">View community page</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-4 sm:p-6 text-fluid-base text-gray-600">No universities available yet.</div>
        )}
      </div>
    </div>
  );
};

export default Universities;
