import ResourceList from '../components/ResourceList';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';

export default function Exams() {
  const { addToast } = useToast();
  return (
     <ResourceList
       title="Exam"
       addPath="/exams/new"
       editPath="/exams/:id/edit"
       viewPath="/exams/:id"
      columns={[
        { key: 'examName', label: 'Name' },
        { key: 'examBody', label: 'Exam Body' },
        { key: 'examCategory', label: 'Category' },
        { key: 'examMode', label: 'Mode' },
        { key: 'status', label: 'Status' },
        { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'createdAt', label: 'Created', type: 'date' }
      ]}
      load={async (params) => {
        try {
          return await adminApi.exams.list(params);
        } catch (err) {
          addToast(err instanceof ApiError ? err.message : 'Failed to load', 'error');
          return { items: [], pagination: { pages: 1 } };
        }
      }}
      deleteAction={(id) => adminApi.exams.delete(id)}
    />
  );
}
