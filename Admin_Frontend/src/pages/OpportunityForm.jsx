import { useNavigate, useParams } from 'react-router-dom';
import ResourceForm from '../components/ResourceForm';
import { adminApi } from '../api/adminApi';

const opportunityTypes = ['Job', 'Internship', 'Scholarship', 'Scheme', 'Fellowship', 'Training', 'Exam', 'Other'];
const workModels = ['Remote', 'Hybrid', 'On-site'];
const sources = ['OFFICIAL_API', 'GOVERNMENT_WEBSITE', 'ADMIN_INPUT', 'PARTNER_API'];
const verificationStatuses = ['Unverified', 'Verified', 'Stale', 'Disputed'];
const opportunityStatuses = ['Draft', 'Active', 'Closed', 'Expired', 'Cancelled'];

const fields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'organization', label: 'Organization', required: true },
  { name: 'opportunityType', label: 'Type', type: 'select', required: true, options: opportunityTypes.map(v => ({ value: v, label: v })) },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'location', label: 'Location' },
  { name: 'workModel', label: 'Work Model', type: 'select', options: workModels.map(v => ({ value: v, label: v })) },
  { name: 'minAge', label: 'Minimum Age', type: 'number' },
  { name: 'maxAge', label: 'Maximum Age', type: 'number' },
  { name: 'educationalQualifications', label: 'Educational Qualifications (JSON)', type: 'json' },
  { name: 'requiredSkills', label: 'Required Skills (JSON)', type: 'json' },
  { name: 'experienceRequired', label: 'Experience Required (JSON)', type: 'json' },
  { name: 'categoryRequirements', label: 'Category Requirements (JSON)', type: 'json' },
  { name: 'incomeRequirements', label: 'Income Requirements (JSON)', type: 'json' },
  { name: 'disabilityRequirements', label: 'Disability Requirements (JSON)', type: 'json' },
  { name: 'domicileRequirements', label: 'Domicile Requirements (JSON)', type: 'json' },
  { name: 'applicationStartDate', label: 'Application Start Date', type: 'date' },
  { name: 'applicationDeadline', label: 'Application Deadline', type: 'date' },
  { name: 'examDate', label: 'Exam Date', type: 'date' },
  { name: 'interviewDate', label: 'Interview Date', type: 'date' },
  { name: 'documentVerificationDate', label: 'Document Verification Date', type: 'date' },
  { name: 'resultDate', label: 'Result Date', type: 'date' },
  { name: 'officialApplicationUrl', label: 'Official Application URL' },
  { name: 'requiredDocuments', label: 'Required Documents (JSON)', type: 'json' },
  { name: 'eligibilityRules', label: 'Eligibility Rules (JSON)', type: 'json' },
  { name: 'source', label: 'Source', type: 'select', options: sources.map(v => ({ value: v, label: v })) },
  { name: 'sourceUrl', label: 'Source URL', required: true },
  { name: 'lastVerifiedAt', label: 'Last Verified At', type: 'date' },
  { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: verificationStatuses.map(v => ({ value: v, label: v })) },
  { name: 'status', label: 'Status', type: 'select', options: opportunityStatuses.map(v => ({ value: v, label: v })) }
];

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ResourceForm
      title={id ? 'Edit Opportunity' : 'New Opportunity'}
      fields={fields}
      addPath="/opportunities"
      load={async (itemId) => adminApi.opportunities.get(itemId)}
      create={async (payload) => { await adminApi.opportunities.create(payload); navigate('/opportunities'); }}
      update={async (itemId, payload) => { await adminApi.opportunities.update(itemId, payload); navigate('/opportunities'); }}
    />
  );
}
