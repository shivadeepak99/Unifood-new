import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendOTPEmail, verifyOTP as verifyOTPLib, generateOTP } from '../lib/email';
import toast from 'react-hot-toast';
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

// Central function to fetch the user's full profile
const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  if (profile) {
    const userData: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      studentId: profile.student_id,
      role: profile.role,
      isVerified: profile.is_verified,
      loyaltyPoints: profile.loyalty_points,
      createdAt: new Date(profile.created_at)
    };
    return userData;
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for a session
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id);
        if (userData) {
          setUser(userData);
        } else {
          console.warn("User session found, but profile not in DB. Logging out.");
          await supabase.auth.signOut();
        }
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for auth state changes and update the user state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        setIsLoading(true);
        const userData = await fetchUserProfile(session.user.id);
        if (userData) {
          setUser(userData);
          toast.success('Successfully logged in!');
        } else {
          console.error("Profile not found after SIGNED_IN event. User needs to register a profile.");
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        toast.error(authError.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!userData.email?.endsWith('@iiitkottayam.ac.in')) {
        toast.error('Please use your IIIT Kottayam email address');
        return false;
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        toast.error('User already exists with this email');
        return false;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) {
        toast.error(authError.message);
        return false;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: userData.name!,
            email: userData.email!,
            student_id: userData.studentId,
            role: 'student',
            is_verified: false,
            loyalty_points: 0
          });

        if (profileError) {
          console.error('Failed to create user profile:', profileError);
          toast.error('Failed to create user profile. Please try again.');
          return false;
        }

        const otp = generateOTP();
        const otpSent = await sendOTPEmail(userData.email!, otp);
        if (otpSent) {
          toast.success('Registration successful! Please check your email for OTP verification.');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      const otp = generateOTP();
      const success = await sendOTPEmail(email, otp);
      if (success) {
        toast.success('OTP sent to your email');
      } else {
        toast.error('Failed to send OTP');
      }
      return success;
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP');
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const isValid = await verifyOTPLib(email, otp);
      if (isValid) {
        const { error } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('email', email);

        if (!error) {
          toast.success('Email verified successfully! You are now logged in.');
          return true;
        }
      }
      toast.error('Invalid or expired OTP');
      return false;
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('OTP verification failed');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success('Password reset email sent!');
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email');
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
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