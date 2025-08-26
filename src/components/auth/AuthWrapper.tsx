import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Login } from './Login';
import { Register } from './Register';
import { OTPVerification } from './OTPVerification';
import { PasswordReset } from './PasswordReset';
import { Utensils, GraduationCap } from 'lucide-react';

type AuthView = 'login' | 'register' | 'verification' | 'reset';

export const AuthWrapper: React.FC = () => {
  const { isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSwitchToVerification = (email: string) => {
    setVerificationEmail(email);
    setCurrentView('verification');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UniFood</h1>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span>IIIT Kottayam Canteen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {currentView === 'login' && (
            <Login
              onSwitchToRegister={() => setCurrentView('register')}
              onSwitchToReset={() => setCurrentView('reset')}
            />
          )}
          {currentView === 'register' && (
            <Register
              onSwitchToLogin={() => setCurrentView('login')}
              onSwitchToVerification={handleSwitchToVerification}
            />
          )}
          {currentView === 'verification' && (
            <OTPVerification
              email={verificationEmail}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
          {currentView === 'reset' && (
            <PasswordReset
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 UniFood - IIIT Kottayam Canteen Management System
          </p>
        </div>
      </footer>
    </div>
  );
};