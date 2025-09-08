import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { Header } from './components/common/Header';
import { Cart } from './components/student/Cart';
import { Settings } from './components/common/Settings';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// This is the component that shows the protected content (dashboard, etc.)
const ProtectedContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('profile');

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
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
          <Routes>
            <Route path="/*" element={<ProtectedContent />} />
            <Route path="/auth" element={<AuthWrapper />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;