import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import apiClient from '@/api/axios';

const AcademicIntegrity = () => {
  const [showTakedownForm, setShowTakedownForm] = useState(false);
  const [formData, setFormData] = useState({
    paperId: '',
    facultyEmail: '',
    facultyName: '',
    reason: 'copyright_violation',
    reasonDescription: '',
  });

  const takedownMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/takedown', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Takedown request submitted successfully. We will review within 5 business days.');
      setFormData({
        paperId: '',
        facultyEmail: '',
        facultyName: '',
        reason: 'copyright_violation',
        reasonDescription: '',
      });
      setShowTakedownForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit takedown request');
    },
  });

  const handleSubmitTakedown = (e) => {
    e.preventDefault();
    if (!formData.paperId || !formData.facultyEmail || !formData.facultyName || !formData.reasonDescription) {
      toast.error('All fields are required');
      return;
    }

    takedownMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-primary-600" />
            Academic Integrity & Takedown Policy
          </h1>
          <p className="text-gray-600 text-lg">Protecting academic standards and intellectual property rights</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* What's Allowed */}
          <section className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-green-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              What's Allowed on Our Platform
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Past examination papers</strong> - Midterm and final exams from previous semesters</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Study guides and notes</strong> - Student-created materials for learning purposes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Sample questions and practice problems</strong> - Educational content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Course materials with permission</strong> - Materials shared with instructor approval</span>
              </li>
            </ul>
          </section>

          {/* What's Not Allowed */}
          <section className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-red-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              What's NOT Allowed
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Copyrighted material</strong> - Published textbooks or copyrighted content without permission</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Ongoing coursework solutions</strong> - Answers to current assignments or exams</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Protected instructor materials</strong> - Lecture notes or proprietary content without permission</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Third-party intellectual property</strong> - Content without proper licensing</span>
              </li>
            </ul>
          </section>

          {/* Faculty Takedown Section */}
          <section className="bg-blue-50 rounded-lg shadow-sm p-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Faculty Takedown Requests
            </h2>
            <p className="text-gray-700 mb-6">
              If you are an instructor, content creator, or copyright holder and believe that content on our platform violates copyright or academic integrity standards, we provide a formal takedown request process.
            </p>

            <div className="bg-white rounded-lg p-6 mb-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Our Takedown Process:</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span>Submit a formal takedown request including your faculty email and institution</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span>Provide detailed description of the violation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span>Content may be temporarily hidden during review (up to 30 days)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  <span>Our team reviews within 5 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                  <span>We notify you of the decision and any action taken</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowTakedownForm(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Submit Takedown Request
            </button>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions or Concerns?</h2>
            <p className="text-gray-700 mb-4">
              For policy questions, concerns, or to report academic integrity violations:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Contact Us
              </Link>
              <p className="text-gray-900"><strong>Response Time:</strong> Within 5 business days</p>
            </div>
          </section>
        </div>
      </div>

      {/* Takedown Form Modal */}
      {showTakedownForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Faculty Takedown Request</h2>

            <form onSubmit={handleSubmitTakedown} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper ID or Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.paperId}
                  onChange={(e) => setFormData({ ...formData, paperId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter the ID of the paper to be removed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.facultyName}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.facultyEmail}
                    onChange={(e) => setFormData({ ...formData, facultyEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="your.name@institution.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="copyright_violation">Copyright Violation</option>
                  <option value="unauthorized_use">Unauthorized Use of Materials</option>
                  <option value="academic_honesty">Academic Honesty Violation</option>
                  <option value="licensing_violation">License Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reasonDescription}
                  onChange={(e) => setFormData({ ...formData, reasonDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="6"
                  placeholder="Please provide detailed information about why this content violates our policy..."
                  required
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTakedownForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={takedownMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {takedownMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicIntegrity;
