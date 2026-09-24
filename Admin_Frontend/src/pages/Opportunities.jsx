import ResourceList from '../components/ResourceList';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';

export default function Opportunities() {
  const { addToast } = useToast();
  return (
    <ResourceList
      title="Opportunity"
      addPath="/opportunities/new"
      editPath="/opportunities/:id/edit"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'organization', label: 'Organization' },
        { key: 'opportunityType', label: 'Type' },
        { key: 'workModel', label: 'Work Model' },
        { key: 'status', label: 'Status' },
        { key: 'verificationStatus', label: 'Verification' },
        { key: 'createdAt', label: 'Created', type: 'date' }
      ]}
      load={async (params) => {
        try {
          return await adminApi.opportunities.list(params);
        } catch (err) {
          addToast(err instanceof ApiError ? err.message : 'Failed to load', 'error');
          return { items: [], pagination: { pages: 1 } };
        }
      }}
      deleteAction={(id) => adminApi.opportunities.delete(id)}
    />
  );
}
