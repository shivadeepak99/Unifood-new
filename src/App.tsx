import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { Header } from './components/common/Header';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {user.role === 'student' ? <StudentDashboard /> : <ManagerDashboard />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;