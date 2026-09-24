import ResourceList from '../components/ResourceList';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';

export default function FormsList() {
  const { addToast } = useToast();
  return (
    <ResourceList
      title="Form"
      addPath="/forms/new"
      editPath="/forms/:id/edit"
      viewPath="/forms/:id"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'exam', label: 'Exam' },
        { key: 'status', label: 'Status' },
        { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'createdAt', label: 'Created', type: 'date' }
      ]}
      load={async (params) => {
        try {
          return await adminApi.forms.list(params);
        } catch (err) {
          addToast(err instanceof ApiError ? err.message : 'Failed to load', 'error');
          return { items: [], pagination: { pages: 1 } };
        }
      }}
      deleteAction={(id) => adminApi.forms.delete(id)}
    />
  );
}
