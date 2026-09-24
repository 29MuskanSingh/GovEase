import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PasswordChange from './pages/PasswordChange';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import EligibilityRules from './pages/EligibilityRules';
import EligibilityRuleForm from './pages/EligibilityRuleForm';
import Exams from './pages/Exams';
import ExamForm from './pages/ExamForm';
import ExamDetail from './pages/ExamDetail';
import DynamicFormRenderer from './components/DynamicFormRenderer';
import FormsList from './pages/FormsList';
import FormBuilderPage from './pages/FormBuilderPage';
import Opportunities from './pages/Opportunities';
import OpportunityForm from './pages/OpportunityForm';
import AuditLogs from './pages/AuditLogs';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.passwordChangeRequired) {
    return <Navigate to="/password-change" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/password-change" element={
        <ProtectedRoute>
          <PasswordChange />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="eligibility-rules" element={<EligibilityRules />} />
        <Route path="eligibility-rules/new" element={<EligibilityRuleForm />} />
        <Route path="eligibility-rules/:id/edit" element={<EligibilityRuleForm />} />
         <Route path="exams" element={<Exams />} />
         <Route path="exams/new" element={<ExamForm />} />
         <Route path="exams/:id" element={<ExamDetail />} />
         <Route path="exams/:id/edit" element={<ExamForm />} />
         <Route path="forms" element={<FormsList />} />
         <Route path="forms/new" element={<FormBuilderPage />} />
         <Route path="forms/:id/edit" element={<FormBuilderPage />} />
         <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/new" element={<OpportunityForm />} />
        <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
}

export default App;