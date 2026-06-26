import React from 'react';
import { useQuery } from 'react-query';
import { Award, Download, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const Certificates = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = React.useState(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 1 && month <= 5) {
      return { semester: 'Spring', year };
    } else if (month >= 8 && month <= 12) {
      return { semester: 'Fall', year };
    }
    return { semester: 'Summer', year };
  });

  const { data: myCerts, isLoading: myCertsLoading } = useQuery({
    queryKey: ['my-certificates', user?._id],
    queryFn: async () => {
      const response = await apiClient.get('/certificates/my-certificates');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['certificates-leaderboard', selectedSemester],
    queryFn: async () => {
      const response = await apiClient.get(
        `/certificates/leaderboard/${selectedSemester.semester}/${selectedSemester.year}`
      );
      return response.data;
    },
  });

  const downloadCertificate = (certId, username) => {
    // In a real implementation, this would generate a PDF
    const link = document.createElement('a');
    link.href = `/api/certificates/${certId}/download`;
    link.download = `certificate-${username}-${certId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-yellow-500" />
            Contributor Certificates
          </h1>
          <p className="text-gray-600">Recognition for outstanding academic contributions</p>
        </div>

        {/* My Certificates Section */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Certificates</h2>
            
            {myCertsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : myCerts?.certificates && myCerts.certificates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myCerts.certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-yellow-400 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cert.display.title}</h3>
                        <p className="text-sm text-gray-600">{cert.display.subtitle}</p>
                      </div>
                      <Award className="w-8 h-8 text-yellow-500" />
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 mb-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Papers Uploaded</span>
                        <span className="font-bold text-gray-900">{cert.display.stats.papersUploaded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Downloads</span>
                        <span className="font-bold text-gray-900">{cert.display.stats.totalDownloads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reputation Points</span>
                        <span className="font-bold text-gray-900">{cert.display.stats.reputation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Universities Reached</span>
                        <span className="font-bold text-gray-900">{cert.display.stats.universitiesReached}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadCertificate(cert._id, user.username)}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No certificates yet. Keep contributing to earn recognition!</p>
                <Link to="/upload" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Upload Your First Paper
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Semester Leaderboard */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Certificate Leaderboard</h2>
            <select
              value={`${selectedSemester.semester}-${selectedSemester.year}`}
              onChange={(e) => {
                const [sem, yr] = e.target.value.split('-');
                setSelectedSemester({ semester: sem, year: parseInt(yr) });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {['Spring', 'Fall', 'Summer'].map((sem) => {
                const years = [2026, 2025, 2024];
                return years.map((year) => (
                  <option key={`${sem}-${year}`} value={`${sem}-${year}`}>
                    {sem} {year}
                  </option>
                ));
              })}
            </select>
          </div>

          {leaderboardLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {['top_contributor', 'active_contributor', 'emerging_contributor'].map((type) => {
                const certs = leaderboard?.certificates?.[type] || [];
                if (certs.length === 0) return null;

                const typeLabels = {
                  top_contributor: '🏆 Top Contributors',
                  active_contributor: '⭐ Active Contributors',
                  emerging_contributor: '🌟 Emerging Contributors',
                };

                return (
                  <div key={type}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{typeLabels[type]}</h3>
                    <div className="grid gap-4">
                      {certs.map((cert) => (
                        <div
                          key={cert._id}
                          className="bg-white rounded-lg p-4 border-l-4 border-primary-500 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl font-bold text-primary-600 w-12 text-center">
                                #{cert.rank}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{cert.user.username}</h4>
                                <p className="text-sm text-gray-600">{cert.user.university}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <p className="text-xs text-gray-500">Papers</p>
                                <p className="font-bold text-gray-900">{cert.display.stats.papersUploaded}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Downloads</p>
                                <p className="font-bold text-gray-900">{cert.display.stats.totalDownloads}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Reputation</p>
                                <p className="font-bold text-gray-900">{cert.display.stats.reputation}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Reach</p>
                                <p className="font-bold text-gray-900">{cert.display.stats.universitiesReached}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;
