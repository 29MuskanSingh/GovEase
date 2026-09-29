import { useParams } from 'react-router-dom';
import { opportunitiesApi } from '../api/examsApi';
import DynamicFormRenderer from '../components/DynamicFormRenderer';

const fetchOpportunityForm = (id) => opportunitiesApi.getForm(id);

export default function OpportunityApplicationPage() {
  const { id } = useParams();
  return (
    <DynamicFormRenderer
      key={id}
      fetchForm={fetchOpportunityForm}
      submitLabel="Submit Application"
    />
  );
}
