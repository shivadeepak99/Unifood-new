import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  sendOTP: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('unifood_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for manager credentials
    if (email === 'manager@iiitkottayam.ac.in' && password === 'manager123') {
      const managerUser: User = {
        id: 'manager_1',
        name: 'Canteen Manager',
        email,
        role: 'manager',
        isVerified: true,
        createdAt: new Date()
      };
      setUser(managerUser);
      localStorage.setItem('unifood_user', JSON.stringify(managerUser));
      setIsLoading(false);
      return true;
    }

    // Check for student credentials (mock validation)
    if (email.endsWith('@iiitkottayam.ac.in') && password) {
      const students = JSON.parse(localStorage.getItem('unifood_students') || '[]');
      const student = students.find((s: User) => s.email === email && s.isVerified);
      
      if (student) {
        setUser(student);
        localStorage.setItem('unifood_user', JSON.stringify(student));
        setIsLoading(false);
        return true;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    // Validate email domain
    if (!userData.email?.endsWith('@iiitkottayam.ac.in')) {
      setIsLoading(false);
      return false;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const students = JSON.parse(localStorage.getItem('unifood_students') || '[]');
    
    // Check if user already exists
    if (students.some((s: User) => s.email === userData.email)) {
      setIsLoading(false);
      return false;
    }

    const newStudent: User = {
      id: `student_${Date.now()}`,
      name: userData.name!,
      email: userData.email!,
      studentId: userData.studentId,
      role: 'student',
      isVerified: false,
      createdAt: new Date(),
      loyaltyPoints: 0
    };

    students.push(newStudent);
    localStorage.setItem('unifood_students', JSON.stringify(students));
    localStorage.setItem('pending_verification', JSON.stringify({ email: userData.email, otp: '123456' }));
    
    setIsLoading(false);
    return true;
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('pending_verification', JSON.stringify({ email, otp: '123456' }));
    return true;
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    const pending = JSON.parse(localStorage.getItem('pending_verification') || '{}');
    
    if (pending.email === email && pending.otp === otp) {
      const students = JSON.parse(localStorage.getItem('unifood_students') || '[]');
      const updatedStudents = students.map((s: User) => 
        s.email === email ? { ...s, isVerified: true } : s
      );
      localStorage.setItem('unifood_students', JSON.stringify(updatedStudents));
      localStorage.removeItem('pending_verification');
      return true;
    }
    
    return false;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 500));
    return email.endsWith('@iiitkottayam.ac.in');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unifood_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      verifyOTP,
      sendOTP,
      resetPassword,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};