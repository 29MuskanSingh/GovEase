import { useNavigate, useParams } from 'react-router-dom';
import ResourceForm from '../components/ResourceForm';
import { adminApi } from '../api/adminApi';

const examCategories = ['Civil Services', 'SSC', 'Banking', 'Railway', 'Defence', 'Police', 'Teaching', 'State PSC', 'PSU', 'Other'];
const examTypes = ['Preliminary', 'Mains', 'Interview', 'Physical Test', 'Skill Test', 'Document Verification', 'Other'];
const examModes = ['Online', 'Offline', 'Hybrid'];
const examStatuses = ['Upcoming', 'Active', 'Closed', 'Expired', 'Cancelled'];

const selectOptions = (arr) => arr.map(v => ({ value: v, label: v }));

const fields = [
  {
    title: 'Basic Information',
    fields: [
      { name: 'examName', label: 'Exam Name', required: true },
      { name: 'examBody', label: 'Exam Body', required: true },
      { name: 'officialWebsite', label: 'Official Website' },
      { name: 'examCategory', label: 'Category', type: 'select', required: true, options: selectOptions(examCategories) },
      { name: 'examType', label: 'Type', type: 'select', required: true, options: selectOptions(examTypes) },
      { name: 'examMode', label: 'Mode', type: 'select', required: true, options: selectOptions(examModes) },
      { name: 'status', label: 'Status', type: 'select', options: selectOptions(examStatuses) },
      { name: 'isActive', label: 'Active', type: 'boolean' }
    ]
  },
  {
    title: 'Vacancies & Application',
    fields: [
      { name: 'totalVacancies', label: 'Total Vacancies', type: 'number' },
      { name: 'applicationFee', label: 'Application Fee', type: 'number' },
      { name: 'applicationStartDate', label: 'Application Start Date', type: 'date' },
      { name: 'applicationDeadline', label: 'Application Deadline', type: 'date' },
      { name: 'notificationSent', label: 'Notification Sent', type: 'boolean' }
    ]
  },
  {
    title: 'Exam Schedule',
    fields: [
      { name: 'examDate', label: 'Exam Date', type: 'date' },
      { name: 'resultDate', label: 'Result Date', type: 'date' },
      { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number' },
      { name: 'scoreValidityYears', label: 'Score Validity (Years)', type: 'number' }
    ]
  },
  {
    title: 'Marks & Criteria',
    fields: [
      { name: 'subjects', label: 'Subjects (JSON)', type: 'json' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number' },
      { name: 'cutoffMarks', label: 'Cutoff Marks', type: 'number' },
      { name: 'negativeMarking', label: 'Negative Marking', type: 'boolean' },
      { name: 'negativeMarkingValue', label: 'Negative Marking Value', type: 'number' },
      { name: 'numberOfAttemptsAllowed', label: 'Attempts Allowed', type: 'number' }
    ]
  },
  {
    title: 'Eligibility',
    fields: [
      { name: 'ageRelaxation', label: 'Age Relaxation (JSON)', type: 'json' },
      { name: 'educationalQualifications', label: 'Educational Qualifications (JSON)', type: 'json' },
      { name: 'physicalRequirements', label: 'Physical Requirements (JSON)', type: 'json' },
      { name: 'eligibilityRules', label: 'Eligibility Rules (JSON)', type: 'json' }
    ]
  }
];

export default function ExamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ResourceForm
      title={id ? 'Edit Exam' : 'New Exam'}
      fields={fields}
      addPath="/exams"
      load={async (itemId) => adminApi.exams.get(itemId)}
      create={async (payload) => { await adminApi.exams.create(payload); navigate('/exams'); }}
      update={async (itemId, payload) => { await adminApi.exams.update(itemId, payload); navigate('/exams'); }}
    />
  );
}
