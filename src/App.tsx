import { useState } from 'react';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { Header } from './components/common/Header';
import { Cart } from './components/student/Cart';
import { Settings } from './components/common/Settings';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';

const AppContent: React.FC = () => {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState('profile');

  if (!auth || !auth.user) {
    return <AuthWrapper />;
  }

  const { user } = auth;

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    if (currentPage === 'settings') {
      return <Settings />;
    }
    if (currentPage === 'cart') {
      return <Cart />;
    }
    return user.role === 'student' ? (
      <StudentDashboard onNavigate={handleNavigate} />
    ) : (
      <ManagerDashboard onNavigate={handleNavigate} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1">
        {renderContent()}
      </main>
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