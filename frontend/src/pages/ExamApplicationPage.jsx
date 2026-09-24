import { useParams } from 'react-router-dom';
import DynamicFormRenderer from '../components/DynamicFormRenderer';

export default function ExamApplicationPage() {
  const { id } = useParams();
  return <DynamicFormRenderer key={id} examId={id} />;
}
