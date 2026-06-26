import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Download, ThumbsUp, Search, SlidersHorizontal, X, Building2, Calendar } from 'lucide-react';
import apiClient from '@/apiClient';

const defaultFilters = {
  search: '',
  university: '',
  department: '',
  course: '',
  semester: '',
  year: '',
};

const StudyHub = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append('limit', '20');
    params.append('sortBy', sortBy === 'newest' ? 'createdAt' : 'downloadCount');
    params.append('sortOrder', 'desc');
    params.append('visibility', 'public');
    return params.toString();
  }, [filters, sortBy]);

  const { data: notesData, isLoading: notesLoading } = useQuery(['notes-page-notes', queryParams], async () => {
    const response = await apiClient.get(`/notes?${queryParams}`);
    return response.data;
  });

  const notes = useMemo(() => notesData?.notes || [], [notesData]);

  const onFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const hasActiveFilters = Object.values(filters).some((value) => value !== '');
  const clearFilters = () => setFilters(defaultFilters);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-fluid-2xl font-bold text-gray-900 mb-2">Notes</h1>
          <p className="text-fluid-base text-gray-600">Discover and download study notes from various universities and courses.</p>
        </div>

        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title, course, or keywords..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto min-h-touch">
                <option value="newest">Newest First</option>
                <option value="popular">Most Downloaded</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary min-h-touch flex items-center space-x-2 ${hasActiveFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary min-h-touch flex items-center space-x-2 text-error-600 hover:text-error-700">
                  <X className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Building2 className="h-4 w-4 inline mr-1" />University</label>
                  <input className="input-field" value={filters.university} onChange={(e) => onFilterChange('university', e.target.value)} placeholder="Filter by university" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><BookOpen className="h-4 w-4 inline mr-1" />Department</label>
                  <input className="input-field" value={filters.department} onChange={(e) => onFilterChange('department', e.target.value)} placeholder="Filter by department" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input className="input-field" value={filters.course} onChange={(e) => onFilterChange('course', e.target.value)} placeholder="Filter by course" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <input className="input-field" value={filters.semester} onChange={(e) => onFilterChange('semester', e.target.value)} placeholder="e.g., Fall 2023" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="h-4 w-4 inline mr-1" />Year</label>
                  <select className="input-field" value={filters.year} onChange={(e) => onFilterChange('year', e.target.value)}>
                    <option value="">All Years</option>
                    {years.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
              {notesData?.total || 0} notes found
            </h2>
            {hasActiveFilters && <p className="text-sm text-gray-600">Filtered results</p>}
          </div>

          {notesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="skeleton skeleton-text w-3/4 mb-2" />
                  <div className="skeleton skeleton-text w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-text w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="card p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-fluid-base text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {notes.map((item) => (
                <div key={item._id} className="card-interactive p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 pr-4 line-clamp-2 text-fluid-sm sm:text-fluid-base">
                      {item.title}
                    </h3>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                      Note
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                    {item.course}
                    {item.courseCode && ` - ${item.courseCode}`}
                  </p>
                  <p className="text-sm sm:text-fluid-base text-gray-600 mt-2 leading-5 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {item.semester} {item.year}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span className="line-clamp-1 pr-2">{item.university}</span>
                    <span className="line-clamp-1 text-right">{item.department}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1.5" />
                        {item.downloadCount || 0}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1.5" />
                        {item.helpfulVotes || 0}
                      </span>
                    </div>
                    <Link to={`/notes/${item._id}`} className="btn-secondary min-h-touch-sm text-xs px-3 py-1.5">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyHub;
