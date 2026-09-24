import { useNavigate, useParams } from 'react-router-dom';
import ResourceForm from '../components/ResourceForm';
import { adminApi } from '../api/adminApi';

const fields = [
  { name: 'ruleName', label: 'Rule Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'field', label: 'Field', required: true },
  { name: 'operator', label: 'Operator', required: true },
  { name: 'params', label: 'Parameters (JSON)', type: 'json' },
  { name: 'failureMessage', label: 'Failure Message', type: 'textarea' },
  { name: 'required', label: 'Required', type: 'boolean' },
  { name: 'ruleVersion', label: 'Rule Version', type: 'number' },
  { name: 'isActive', label: 'Active', type: 'boolean' }
];

export default function EligibilityRuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ResourceForm
      title={id ? 'Edit Eligibility Rule' : 'New Eligibility Rule'}
      fields={fields}
      addPath="/eligibility-rules"
      load={async (itemId) => adminApi.eligibilityRules.get(itemId)}
      create={async (payload) => { await adminApi.eligibilityRules.create(payload); navigate('/eligibility-rules'); }}
      update={async (itemId, payload) => { await adminApi.eligibilityRules.update(itemId, payload); navigate('/eligibility-rules'); }}
    />
  );
}
