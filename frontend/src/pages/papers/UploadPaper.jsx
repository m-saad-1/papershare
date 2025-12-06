import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  X,
  Plus,
  BookOpen,
  Building2,
  Calendar
} from 'lucide-react';

const UploadPaper = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // 1. Get token from AuthContext
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    university: user?.university || '',
    department: user?.department || '',
    course: '',
    courseCode: '',
    teacher: '',
    semester: '',
    year: new Date().getFullYear(),
    paperType: 'mid',
    tags: '',
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

 const uploadMutation = useMutation(
  (data) => {
    // When sending FormData, we must let the browser set the 'Content-Type' header.
    // This ensures the 'boundary' part of the header is correctly generated.
    // We only need to manually add the Authorization header.
    return axios.post('/papers/upload', data, {
      headers: { 
        // DO NOT set 'Content-Type': 'multipart/form-data' manually.
        'Authorization': `Bearer ${token}` },
    });
  },
    {
      onSuccess: () => {
        toast.success('Paper uploaded successfully! It will be reviewed by our team.');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload paper');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        toast.error('Please drop a PDF file');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    // Add a guard to ensure the token is available before submitting
    if (!token) {
      toast.error('You must be logged in to upload a paper. Please wait or log in again.');
      return;
    }

    // Create FormData here, right before mutation
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (file) {
      data.append('file', file);
    }
    uploadMutation.mutate(data);
  };

  const universities = [
    'University of Technology',
    'State University',
    'City College',
    'National University',
    'Technical Institute',
    'Business School',
    'Engineering College'
  ];

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology'
  ];

  const paperTypes = [
    { value: 'mid', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Past Paper</h1>
          <p className="text-gray-600">
            Share your past papers with the student community. All uploads are reviewed before publishing.
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                Paper Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
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
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
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
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
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
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="paperType" className="block text-sm font-medium text-gray-700 mb-2">
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
                    {paperTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* File Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                File Upload
              </h2>

              {!file ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${
                    isDragging
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file').click()}
                >
                  <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        <span className="text-primary-600 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PDF only (Max 10MB)</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure the paper is in PDF format and under 10MB</li>
                <li>• Verify that the paper content matches the provided information</li>
                <li>• Do not upload copyrighted material without permission</li>
                <li>• All papers are reviewed by our team before publishing</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isLoading || !file || !token}
                className="btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploadMutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </div>
                ) : !token && file ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Paper
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPaper;