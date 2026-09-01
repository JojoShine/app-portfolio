import { CURRENT_YEAR } from '../domain/constants';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const getLegacyApplicationNumber = (application) => {
  const createdAt = new Date(application.createdAt || application.updatedAt || Date.now());
  const datePart = Number.isNaN(createdAt.getTime())
    ? String(CURRENT_YEAR)
    : `${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}`;
  const idPart = String(application.id || '')
    .replace(/[^a-f\d]/gi, '')
    .slice(-10)
    .split('')
    .map((character) => Number.parseInt(character, 16) % 10)
    .join('')
    .padStart(10, '0');
  return `BM${datePart}${idPart}`;
};

export const normalizeSchool = (school) => ({
  ...school,
  categoryId: school.categoryId || school.category,
  category: school.categoryLabel || school.categoryName || school.category,
  scope: school.scope || school.scopeSummary || '',
  dates: school.dates || (school.registration
    ? `${formatDate(school.registration.startsAt)}—${formatDate(school.registration.endsAt)}`
    : ''),
  policyVersion: school.policyVersion || 'V1.0',
});

export const normalizeApplication = (application) => ({
  ...application,
  applicationNumber: application.applicationNumber || application.submissionReceipt || getLegacyApplicationNumber(application),
  studentName: application.studentName || '',
  maskedStudentName: application.maskedStudentName || (application.studentName ? `${application.studentName.slice(0, 1)}*${application.studentName.slice(-1)}` : ''),
  schoolName: application.schoolName || application.school?.name || '',
  stageName: application.stageName || application.stage,
  categoryName: application.categoryName || application.category,
  status: application.statusLabel || ({
    draft: '待提交',
    reviewing: '审核中',
    returned: '退回修改',
    initial_approved: '初审通过',
    initial_rejected: '初审不通过',
    admitted: '已录取',
  }[application.status]) || application.status,
  updatedAt: application.updatedAt || '',
});
