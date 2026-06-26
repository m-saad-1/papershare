import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { Upload, FileText, BookOpen, StickyNote, Link as LinkIcon } from 'lucide-react';
import apiClient from '../../apiClient';
import { useAuth } from '@/context/AuthContext';

const MANUAL_DEPARTMENT_VALUE = '__manual__';

const REGISTERED_UNIVERSITIES = [
  'IMSciences Peshawar',
  'UET Peshawar',
  'University of Peshawar',
  'Sarhad University',
  'NUML Peshawar',
  'FAST Peshawar',
];

const UNIVERSITY_DEPARTMENTS = {
  'IMSciences Peshawar': [
    'BS - Hospitality & Tourism',
    'BBA - Business Administration',
    'BS - Accounting and Finance',
    'BS - Business Analytics',
    'MBA - Business Administration',
    'MS - Management',
    'MS - Islamic Business & Finance',
    'MS - Project Management',
    'PhD - Islamic Business & Finance',
    'PhD - Management',
    'BS - Computer Science',
    'BS - Software Engineering',
    'BS - Artificial Intelligence',
    'BS - Data Science',
    'BS - Cyber Security',
    'MS - Computer Science',
    'MS - Data Science',
    'MS - Data Science (Specialization in Biomedicine)',
    'PhD - Computer Science',
    'BS - Social Sciences',
    'BS - Psychology',
    'BS - Economics',
    'BS - English',
    'M.Phil - English (Linguistics)',
    'MS - Governance & Public Policy',
    'MS - Development Studies',
    'MS - Economics',
    'PhD - Economics',
  ],
};

const normalizeUniversity = (value = '') => {
  if (value === 'IMS Peshawar') {
    return 'IMSciences Peshawar';
  }

  return value;
};

const getDepartmentOptions = (university) => {
  const normalizedUniversity = normalizeUniversity(university);
  return UNIVERSITY_DEPARTMENTS[normalizedUniversity] || [];
};

const createInitialFormState = (overrides = {}) => ({
  title: '',
  description: '',
  university: '',
  department: '',
  course: '',
  courseCode: '',
  semester: '',
  year: new Date().getFullYear(),
  tags: '',
  universityOption: '',
  customUniversity: '',
  departmentOption: '',
  customDepartment: '',
  ...overrides,
});

const UploadPaper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { token, updateUserContext } = useAuth();
  const requestedPaperId = searchParams.get('requestId');

  const [activeTab, setActiveTab] = useState(location.state?.activeTab === 'notes' ? 'notes' : 'paper');
  const [paperFile, setPaperFile] = useState(null);
  const [noteFile, setNoteFile] = useState(null);

  const [paperForm, setPaperForm] = useState(
    createInitialFormState({
      teacher: '',
      paperType: 'mid',
    })
  );
  const [noteForm, setNoteForm] = useState(createInitialFormState());

  const { data: linkedRequestData } = useQuery(
    ['requested-paper-details', requestedPaperId],
    async () => {
      const response = await apiClient.get(`/requests/${requestedPaperId}`);
      return response.data?.request;
    },
    {
      enabled: !!requestedPaperId && activeTab === 'paper',
      onSuccess: (request) => {
        if (!request) return;

        const mappedPaperType = ['mid', 'final', 'quiz', 'assignment'].includes(request.examType)
          ? request.examType
          : 'mid';

        const matchedUniversity = REGISTERED_UNIVERSITIES.includes(request.university)
          ? request.university
          : 'Other';
        const departmentOptions = getDepartmentOptions(request.university);
        const matchedDepartment = departmentOptions.includes(request.department)
          ? request.department
          : MANUAL_DEPARTMENT_VALUE;

        setPaperForm((previous) => ({
          ...previous,
          title: request.title?.trim() || `${request.courseName} ${String(request.examType || '').toUpperCase()} ${request.year}`,
          description: request.description || previous.description,
          university: request.university,
          department: request.department,
          course: request.courseName,
          paperType: mappedPaperType,
          year: Number(request.year) || previous.year,
          universityOption: matchedUniversity,
          customUniversity: matchedUniversity === 'Other' ? request.university : '',
          departmentOption: matchedDepartment,
          customDepartment: matchedDepartment === MANUAL_DEPARTMENT_VALUE ? request.department : '',
        }));
      },
    }
  );

  const paperDepartmentOptions = getDepartmentOptions(
    paperForm.universityOption === 'Other' ? paperForm.customUniversity : paperForm.universityOption
  );
  const noteDepartmentOptions = getDepartmentOptions(
    noteForm.universityOption === 'Other' ? noteForm.customUniversity : noteForm.universityOption
  );

  const handleUniversitySelection = (setForm) => (event) => {
    const universityOption = event.target.value;

    setForm((previous) => ({
      ...previous,
      universityOption,
      customUniversity: universityOption === 'Other' ? previous.customUniversity : '',
      departmentOption: '',
      customDepartment: '',
    }));
  };

  const handleCustomUniversityChange = (setForm) => (event) => {
    const customUniversity = event.target.value;

    setForm((previous) => ({
      ...previous,
      customUniversity,
      departmentOption: '',
      customDepartment: '',
    }));
  };

  const handleDepartmentSelection = (setForm) => (event) => {
    const departmentOption = event.target.value;

    setForm((previous) => ({
      ...previous,
      departmentOption,
      customDepartment: departmentOption === MANUAL_DEPARTMENT_VALUE ? previous.customDepartment : '',
    }));
  };

  const paperMutation = useMutation(
    async (data) => apiClient.post('/papers/upload', data, { headers: { Authorization: `Bearer ${token}` } }),
    {
      onSuccess: async () => {
        toast.success('Paper submitted for admin approval');
        const me = await apiClient.get('/auth/me').catch(() => null);
        if (me?.data?.user) updateUserContext(me.data.user);
        navigate('/dashboard');
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to upload paper'),
    }
  );

  const notesMutation = useMutation(
    async (data) => apiClient.post('/notes/upload', data, { headers: { Authorization: `Bearer ${token}` } }),
    {
      onSuccess: async () => {
        toast.success('Notes submitted for approval');
        const me = await apiClient.get('/auth/me').catch(() => null);
        if (me?.data?.user) updateUserContext(me.data.user);
        navigate('/dashboard', { state: { activeTab: 'notes' } });
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to upload notes'),
    }
  );

  const submitPaper = (e) => {
    e.preventDefault();
    if (!paperFile) return toast.error('Please select a PDF file');

    const resolvedUniversity = paperForm.universityOption === 'Other'
      ? paperForm.customUniversity.trim()
      : normalizeUniversity(paperForm.universityOption);
    const resolvedDepartment = paperForm.departmentOption === MANUAL_DEPARTMENT_VALUE
      ? paperForm.customDepartment.trim()
      : paperForm.departmentOption;

    if (!resolvedUniversity) {
      return toast.error('Please select or enter your university');
    }

    if (!resolvedDepartment) {
      return toast.error('Please select or enter your department/program');
    }

    const data = new FormData();
    Object.entries(paperForm).forEach(([key, value]) => {
      if (!['universityOption', 'customUniversity', 'departmentOption', 'customDepartment'].includes(key)) {
        data.append(key, value);
      }
    });
    data.set('university', resolvedUniversity);
    data.set('department', resolvedDepartment);
    if (linkedRequestData?._id) {
      data.append('linkedRequestId', linkedRequestData._id);
    }
    data.append('file', paperFile);
    paperMutation.mutate(data);
  };

  const submitNotes = (e) => {
    e.preventDefault();
    if (!noteFile) return toast.error('Please select a notes file');

    const resolvedUniversity = noteForm.universityOption === 'Other'
      ? noteForm.customUniversity.trim()
      : normalizeUniversity(noteForm.universityOption);
    const resolvedDepartment = noteForm.departmentOption === MANUAL_DEPARTMENT_VALUE
      ? noteForm.customDepartment.trim()
      : noteForm.departmentOption;

    if (!resolvedUniversity) {
      return toast.error('Please select or enter your university');
    }

    if (!resolvedDepartment) {
      return toast.error('Please select or enter your department/program');
    }

    const data = new FormData();
    Object.entries(noteForm).forEach(([key, value]) => {
      if (!['universityOption', 'customUniversity', 'departmentOption', 'customDepartment'].includes(key)) {
        data.append(key, value);
      }
    });
    data.set('university', resolvedUniversity);
    data.set('department', resolvedDepartment);
    data.append('file', noteFile);
    notesMutation.mutate(data);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-fluid-2xl font-bold text-gray-900 mb-2">Upload</h1>
          <p className="text-fluid-base text-gray-600">Easy switch between Paper and Notes upload forms.</p>
        </div>

        <div className="card p-3 mb-4 sm:mb-6 flex gap-2">
          <button type="button" onClick={() => setActiveTab('paper')} className={`min-h-touch px-4 py-2 rounded-lg text-sm font-medium flex items-center ${activeTab === 'paper' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            <FileText className="h-4 w-4 mr-1" /> Paper
          </button>
          <button type="button" onClick={() => setActiveTab('notes')} className={`min-h-touch px-4 py-2 rounded-lg text-sm font-medium flex items-center ${activeTab === 'notes' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            <StickyNote className="h-4 w-4 mr-1" /> Notes
          </button>
        </div>

        {activeTab === 'paper' ? (
          <div className="card p-4 sm:p-6">
            <h2 className="text-fluid-xl font-semibold text-gray-900 mb-4 sm:mb-5 flex items-center"><BookOpen className="h-5 w-5 mr-2 text-primary-600" />Upload Past Paper</h2>
            {linkedRequestData?._id && (
              <div className="mb-5 rounded-lg border border-primary-200 bg-primary-50 p-4">
                <div className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
                  <LinkIcon className="h-4 w-4" />
                  Linked Request Fulfillment
                </div>
                <p className="mt-1 text-sm text-primary-900 font-medium">
                  {linkedRequestData.title || `${linkedRequestData.courseName} (${String(linkedRequestData.examType || '').toUpperCase()} ${linkedRequestData.year})`}
                </p>
                <p className="text-xs text-primary-800 mt-1">
                  Requester: {linkedRequestData.requester?.username || 'Unknown'}
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  This submission will be sent to admin with request linkage for verification before approval.
                </p>
              </div>
            )}
            <form onSubmit={submitPaper} className="space-y-4 sm:space-y-6">
              <input className="input-field" placeholder="Title" value={paperForm.title} onChange={(e) => setPaperForm((previous) => ({ ...previous, title: e.target.value }))} required />
              <textarea className="input-field" rows={3} placeholder="Description" value={paperForm.description} onChange={(e) => setPaperForm((previous) => ({ ...previous, description: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <select className="input-field" value={paperForm.universityOption} onChange={handleUniversitySelection(setPaperForm)} required>
                    <option value="">Select University</option>
                    {REGISTERED_UNIVERSITIES.map((university) => <option key={university} value={university}>{university}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {paperForm.universityOption === 'Other' && (
                    <input
                      className="input-field mt-2"
                      placeholder="Enter your university"
                      value={paperForm.customUniversity}
                      onChange={handleCustomUniversityChange(setPaperForm)}
                      required
                    />
                  )}
                </div>

                <div>
                  <select
                    className="input-field"
                    value={paperForm.departmentOption}
                    onChange={handleDepartmentSelection(setPaperForm)}
                    required
                    disabled={!paperForm.universityOption || (paperForm.universityOption === 'Other' && !paperForm.customUniversity.trim())}
                  >
                    <option value="">Select Department</option>
                    {paperDepartmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                    <option value={MANUAL_DEPARTMENT_VALUE}>Enter Department Manually</option>
                  </select>
                  {paperForm.departmentOption === MANUAL_DEPARTMENT_VALUE && (
                    <input
                      className="input-field mt-2"
                      placeholder="Enter your department"
                      value={paperForm.customDepartment}
                      onChange={(e) => setPaperForm((previous) => ({ ...previous, customDepartment: e.target.value }))}
                      list="paper-department-suggestions"
                      required
                    />
                  )}
                  <datalist id="paper-department-suggestions">
                    {paperDepartmentOptions.map((department) => <option key={department} value={department} />)}
                  </datalist>
                </div>

                <input className="input-field" placeholder="Course" value={paperForm.course} onChange={(e) => setPaperForm((previous) => ({ ...previous, course: e.target.value }))} required />
                <input className="input-field" placeholder="Course Code" value={paperForm.courseCode} onChange={(e) => setPaperForm((previous) => ({ ...previous, courseCode: e.target.value }))} required />
                <input className="input-field" placeholder="Teacher" value={paperForm.teacher} onChange={(e) => setPaperForm((previous) => ({ ...previous, teacher: e.target.value }))} />
                <input className="input-field" placeholder="Semester" value={paperForm.semester} onChange={(e) => setPaperForm((previous) => ({ ...previous, semester: e.target.value }))} required />
                <select className="input-field" value={paperForm.year} onChange={(e) => setPaperForm((previous) => ({ ...previous, year: Number(e.target.value) }))}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
                <select className="input-field" value={paperForm.paperType} onChange={(e) => setPaperForm((previous) => ({ ...previous, paperType: e.target.value }))}>
                  <option value="mid">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <input className="input-field" placeholder="Tags (comma separated)" value={paperForm.tags} onChange={(e) => setPaperForm((previous) => ({ ...previous, tags: e.target.value }))} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 min-h-touch flex items-center justify-center">
                <input type="file" accept=".pdf,application/pdf" className="input-field w-full" onChange={(e) => setPaperFile(e.target.files?.[0] || null)} required />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" className="btn-secondary min-h-touch" onClick={() => navigate('/dashboard')}>Cancel</button>
                <button type="submit" className="btn-primary min-h-touch" disabled={paperMutation.isLoading || !token}>
                  <Upload className="h-4 w-4 mr-2 inline" />{paperMutation.isLoading ? 'Uploading...' : 'Upload Paper'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-4 sm:p-6">
            <h2 className="text-fluid-xl font-semibold text-gray-900 mb-4 sm:mb-5 flex items-center"><StickyNote className="h-5 w-5 mr-2 text-primary-600" />Upload Notes</h2>
            <form onSubmit={submitNotes} className="space-y-4 sm:space-y-6">
              <input className="input-field" placeholder="Title" value={noteForm.title} onChange={(e) => setNoteForm((previous) => ({ ...previous, title: e.target.value }))} required />
              <textarea className="input-field" rows={3} placeholder="Description" value={noteForm.description} onChange={(e) => setNoteForm((previous) => ({ ...previous, description: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <select className="input-field" value={noteForm.universityOption} onChange={handleUniversitySelection(setNoteForm)} required>
                    <option value="">Select University</option>
                    {REGISTERED_UNIVERSITIES.map((university) => <option key={university} value={university}>{university}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {noteForm.universityOption === 'Other' && (
                    <input
                      className="input-field mt-2"
                      placeholder="Enter your university"
                      value={noteForm.customUniversity}
                      onChange={handleCustomUniversityChange(setNoteForm)}
                      required
                    />
                  )}
                </div>

                <div>
                  <select
                    className="input-field"
                    value={noteForm.departmentOption}
                    onChange={handleDepartmentSelection(setNoteForm)}
                    required
                    disabled={!noteForm.universityOption || (noteForm.universityOption === 'Other' && !noteForm.customUniversity.trim())}
                  >
                    <option value="">Select Department</option>
                    {noteDepartmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                    <option value={MANUAL_DEPARTMENT_VALUE}>Enter Department Manually</option>
                  </select>
                  {noteForm.departmentOption === MANUAL_DEPARTMENT_VALUE && (
                    <input
                      className="input-field mt-2"
                      placeholder="Enter your department"
                      value={noteForm.customDepartment}
                      onChange={(e) => setNoteForm((previous) => ({ ...previous, customDepartment: e.target.value }))}
                      list="note-department-suggestions"
                      required
                    />
                  )}
                  <datalist id="note-department-suggestions">
                    {noteDepartmentOptions.map((department) => <option key={department} value={department} />)}
                  </datalist>
                </div>

                <input className="input-field" placeholder="Course" value={noteForm.course} onChange={(e) => setNoteForm((previous) => ({ ...previous, course: e.target.value }))} required />
                <input className="input-field" placeholder="Course Code" value={noteForm.courseCode} onChange={(e) => setNoteForm((previous) => ({ ...previous, courseCode: e.target.value }))} />
                <input className="input-field" placeholder="Semester" value={noteForm.semester} onChange={(e) => setNoteForm((previous) => ({ ...previous, semester: e.target.value }))} required />
                <select className="input-field" value={noteForm.year} onChange={(e) => setNoteForm((previous) => ({ ...previous, year: Number(e.target.value) }))}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
              </div>
              <input className="input-field" placeholder="Tags (comma separated)" value={noteForm.tags} onChange={(e) => setNoteForm((previous) => ({ ...previous, tags: e.target.value }))} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 min-h-touch flex items-center justify-center">
                <input type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp" className="input-field w-full" onChange={(e) => setNoteFile(e.target.files?.[0] || null)} required />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" className="btn-secondary min-h-touch" onClick={() => navigate('/notes')}>Cancel</button>
                <button type="submit" className="btn-primary min-h-touch" disabled={notesMutation.isLoading || !token}>
                  <Upload className="h-4 w-4 mr-2 inline" />{notesMutation.isLoading ? 'Uploading...' : 'Upload Notes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPaper;
