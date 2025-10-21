import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PasswordResetProps {
  onSwitchToLogin: () => void;
}

// Rate limiting configuration 🔥
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

interface RateLimitData {
  attempts: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const { resetPassword } = useAuth();

  // Get rate limit data from localStorage for this email 💾
  const getRateLimitData = (email: string): RateLimitData | null => {
    const key = `password_reset_${email}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  // Save rate limit data to localStorage 💖
  const saveRateLimitData = (email: string, data: RateLimitData) => {
    const key = `password_reset_${email}`;
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Check if user is rate limited and calculate cooldown ⏰
  const checkRateLimit = (email: string): { isLimited: boolean; remainingTime: number; attemptsLeft: number } => {
    const data = getRateLimitData(email);
    if (!data) {
      return { isLimited: false, remainingTime: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    const now = Date.now();
    const timeSinceFirst = now - data.firstAttemptTime;

    // Reset if window has passed 🔄
    if (timeSinceFirst > RATE_LIMIT_WINDOW) {
      localStorage.removeItem(`password_reset_${email}`);
      return { isLimited: false, remainingTime: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    // Check if maxed out 🚫
    if (data.attempts >= MAX_ATTEMPTS) {
      const remainingTime = RATE_LIMIT_WINDOW - timeSinceFirst;
      return { isLimited: true, remainingTime, attemptsLeft: 0 };
    }

    return { isLimited: false, remainingTime: 0, attemptsLeft: MAX_ATTEMPTS - data.attempts };
  };

  // Update rate limit data when email changes 👀
  useEffect(() => {
    if (email && email.includes('@')) {
      const data = getRateLimitData(email);
      setRateLimitData(data);
      
      const { isLimited, remainingTime } = checkRateLimit(email);
      if (isLimited) {
        setCooldownTime(remainingTime);
      } else {
        setCooldownTime(0);
      }
    }
  }, [email]);

  // Cooldown timer countdown ⏳
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const interval = setInterval(() => {
      setCooldownTime(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          // Cooldown ended! Clear rate limit data 🎉
          if (email) {
            localStorage.removeItem(`password_reset_${email}`);
            setRateLimitData(null);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownTime, email]);

  // Format cooldown time as MM:SS 💅
  const formatCooldown = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate email format 📧
    if (!email || !email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    // Validate institutional email 🎓
    if (!email.endsWith('@iiitkottayam.ac.in')) {
      setStatus('error');
      setMessage('Please use your institutional email (@iiitkottayam.ac.in)');
      return;
    }

    // Check rate limit 🛡️
    const { isLimited, remainingTime } = checkRateLimit(email);
    
    if (isLimited) {
      setStatus('error');
      setMessage(`Too many attempts. Please try again in ${formatCooldown(remainingTime)}`);
      setCooldownTime(remainingTime);
      return;
    }

    setStatus('loading');

    try {
      // Update rate limit data 📊
      const existingData = getRateLimitData(email);
      const now = Date.now();
      
      const newData: RateLimitData = existingData
        ? {
            attempts: existingData.attempts + 1,
            firstAttemptTime: existingData.firstAttemptTime,
            lastAttemptTime: now
          }
        : {
            attempts: 1,
            firstAttemptTime: now,
            lastAttemptTime: now
          };
      
      saveRateLimitData(email, newData);
      setRateLimitData(newData);

      // Call the reset password function 💌
      await resetPassword(email);
      
      setStatus('success');
      setMessage(
        'Password reset instructions have been sent to your email. ' +
        'Please check your inbox and follow the link to reset your password. ' +
        '(In development mode, check the browser console for the reset link)'
      );
      setEmail('');
      
      // Clear rate limit after successful send 🎊
      setTimeout(() => {
        localStorage.removeItem(`password_reset_${email}`);
        setRateLimitData(null);
      }, 2000);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to send reset instructions. Please try again.');
    }
  };

  const { attemptsLeft } = email && email.includes('@') ? checkRateLimit(email) : { attemptsLeft: MAX_ATTEMPTS };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}

        {/* Cooldown Timer */}
        {cooldownTime > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">Rate limit active</p>
              <p>Please wait <span className="font-mono font-bold">{formatCooldown(cooldownTime)}</span> before trying again</p>
            </div>
          </div>
        )}

        {/* Attempts remaining indicator */}
        {attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && !cooldownTime && (
          <div className="mb-4 text-sm text-gray-600 text-center">
            <span className="font-semibold">{attemptsLeft}</span> attempt{attemptsLeft !== 1 ? 's' : ''} remaining
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="your.email@iiitkottayam.ac.in"
                disabled={status === 'loading' || cooldownTime > 0}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || cooldownTime > 0}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : cooldownTime > 0 ? (
              'Please Wait...'
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <button
          onClick={onSwitchToLogin}
          className="mt-6 w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {/* Development Mode Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Development Mode:</span> Password reset links will be logged to the browser console. 
            In production, these would be sent via email.
          </p>
        </div>
      </div>
    </div>
  );
};
