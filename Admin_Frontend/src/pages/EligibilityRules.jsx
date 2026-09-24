import ResourceList from '../components/ResourceList';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';

export default function EligibilityRules() {
  const { addToast } = useToast();
  return (
    <ResourceList
      title="Eligibility Rule"
      addPath="/eligibility-rules/new"
      editPath="/eligibility-rules/:id/edit"
      columns={[
        { key: 'ruleName', label: 'Rule Name' },
        { key: 'field', label: 'Field' },
        { key: 'operator', label: 'Operator' },
        { key: 'required', label: 'Required', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'createdAt', label: 'Created', type: 'date' }
      ]}
      load={async (params) => {
        try {
          return await adminApi.eligibilityRules.list(params);
        } catch (err) {
          addToast(err instanceof ApiError ? err.message : 'Failed to load', 'error');
          return { items: [], pagination: { pages: 1 } };
        }
      }}
      deleteAction={(id) => adminApi.eligibilityRules.delete(id)}
    />
  );
}
