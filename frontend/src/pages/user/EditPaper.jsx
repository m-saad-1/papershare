import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Loader2,
  Save,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
} from 'lucide-react';

const EditPaper = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    university: '',
    department: '',
    course: '',
    courseCode: '',
    teacher: '',
    semester: '',
    year: new Date().getFullYear(),
    paperType: 'mid',
    tags: '',
  });

  useEffect(() => {
    console.log('EditPaper component mounted with paperId:', paperId);
  }, [paperId]);

  const { data: paperData, isLoading, isError } = useQuery(
    ['paper', paperId],
    async () => {
      const response = await axios.get(`/api/papers/${paperId}`);
      return response.data;
    },
    {
      enabled: !!paperId,
    }
  );

  useEffect(() => {
    if (paperData) {
      setFormData({
        title: paperData.title || '',
        description: paperData.description || '',
        university: paperData.university || '',
        department: paperData.department || '',
        course: paperData.course || '',
        courseCode: paperData.courseCode || '',
        teacher: paperData.teacher || '',
        semester: paperData.semester || '',
        year: paperData.year || new Date().getFullYear(),
        paperType: paperData.paperType || 'mid',
        tags: Array.isArray(paperData.tags) ? paperData.tags.join(', ') : '',
      });
    }
  }, [paperData]);

  const updatePaperMutation = useMutation(
    (updatedPaper) => {
        const dataToSend = {
            ...updatedPaper,
            tags: updatedPaper.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          };
      return axios.patch(`/api/papers/${paperId}`, dataToSend)
    },
    {
      onSuccess: () => {
        toast.success('Paper updated successfully!');
        queryClient.invalidateQueries(['paper', paperId]);
        queryClient.invalidateQueries('user-papers');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || 'Failed to update paper.'
        );
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paperId) {
      toast.error('Paper ID is missing. Cannot update.');
      return;
    }
    console.log('Updating paper with ID:', paperId);
    updatePaperMutation.mutate(formData);
  };

  const universities = [
    'University of Technology',
    'State University',
    'City College',
    'National University',
    'Technical Institute',
    'Business School',
    'Engineering College',
  ];

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
  ];

  const paperTypes = [
    { value: 'mid', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <span className="ml-4 text-xl text-gray-700">Loading Paper...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-error-600">Error</h2>
        <p className="text-gray-600 mt-2">
          Could not load paper details. Please try again later.
        </p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 mr-4"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Paper</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
              Paper Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Paper Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Final Exam - Data Structures and Algorithms"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Provide additional context about this paper..."
                />
              </div>

              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Name *
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>

              <div>
                <label
                  htmlFor="courseCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseCode"
                  name="courseCode"
                  required
                  value={formData.courseCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., CS-201"
                />
              </div>

              <div>
                <label
                  htmlFor="teacher"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Teacher / Instructor
                </label>
                <input
                  type="text"
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Dr. Alan Turing"
                />
              </div>

              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Building2 className="h-4 w-4 inline mr-1" />
                  University *
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department *
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Semester *
                </label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Fall 2023"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Year *
                </label>
                <select
                  id="year"
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="paperType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Paper Type *
                </label>
                <select
                  id="paperType"
                  name="paperType"
                  required
                  value={formData.paperType}
                  onChange={handleChange}
                  className="input-field"
                >
                  {paperTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., algorithms, data-structures, programming"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary mr-3"
              disabled={updatePaperMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={updatePaperMutation.isLoading}
            >
              {updatePaperMutation.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {updatePaperMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaper;
