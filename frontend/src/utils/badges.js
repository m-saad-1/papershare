export const BADGE_META = {
  first_upload: { name: 'First Upload', short: 'First Upload' },
  contributor: { name: 'Contributor', short: 'Contributor' },
  department_hero: { name: 'Department Hero', short: 'Dept Hero' },
  exam_saver: { name: 'Exam Saver', short: 'Exam Saver' },
  knowledge_king: { name: 'Knowledge King', short: 'Knowledge King' },
  study_guide: { name: 'Study Guide', short: 'Study Guide' },
};

export const mapBadgeKeys = (badgeKeys = []) => (
  (Array.isArray(badgeKeys) ? badgeKeys : [])
    .map((key) => ({ key, ...(BADGE_META[key] || { name: key, short: key }) }))
);
