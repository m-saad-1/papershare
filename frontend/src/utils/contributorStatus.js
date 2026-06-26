export const CONTRIBUTOR_STATUS_META = {
  Student: { label: 'Student', className: 'bg-gray-100 text-gray-700 border-gray-200', colorClass: 'bg-gray-100 text-gray-700' },
  Contributor: { label: 'Contributor', className: 'bg-blue-100 text-blue-700 border-blue-200', colorClass: 'bg-blue-100 text-blue-700' },
  'Verified Contributor': { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200', colorClass: 'bg-green-100 text-green-700' },
  'Top Scholar': { label: 'Top Scholar', className: 'bg-purple-100 text-purple-700 border-purple-200', colorClass: 'bg-purple-100 text-purple-700' },
  'Campus Ambassador': { label: '🎖️ Ambassador', className: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 font-semibold', colorClass: 'bg-amber-100 text-amber-800' },
};

export const getContributorStatusMeta = (status) =>
  CONTRIBUTOR_STATUS_META[status] || CONTRIBUTOR_STATUS_META.Student;
