import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { validatePassword, getStrengthColor, getStrengthText } from '../../lib/passwordValidator';
import toast from 'react-hot-toast';

export const UpdatePassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      // Check if we have an access token (from Supabase password reset link)
      const accessToken = searchParams.get('access_token');
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      // 🔥 DEMO MODE: Accept demo tokens
      if (type === 'recovery' && token && token.startsWith('demo_reset_token_')) {
        console.log('✅ Demo mode: Token accepted for testing');
        setTokenValid(true);
        setIsValidatingToken(false);
        return;
      }
      
      if (type === 'recovery' && accessToken) {
        // Token is valid, Supabase will handle it automatically
        setTokenValid(true);
      } else {
        // Check if user is in a password recovery session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setTokenValid(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
          setTokenValid(false);
        }
      }
      setIsValidatingToken(false);
    };

    validateToken();
  }, [searchParams]);

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Please fix password issues before continuing');
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 Check if we're in demo mode
      const token = searchParams.get('token');
      const isDemoMode = token && token.startsWith('demo_reset_token_');
      
      if (isDemoMode) {
        // 🎮 DEMO MODE: We need to extract email from the demo URL
        // The email should be stored in localStorage from the reset request
        const email = localStorage.getItem('demo_reset_email');
        
        if (!email) {
          setError('Session expired. Please request a new password reset link.');
          setIsLoading(false);
          return;
        }

        // Get the user by email to update their password
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          setError('User not found. Please try again.');
          setIsLoading(false);
          return;
        }

        // 🚨 DEMO MODE LIMITATION: Supabase won't let us update passwords without proper auth token
        // WORKAROUND: Show message to user with instructions
        
        console.log('🔐 ═══════════════════════════════════════════════════════');
        console.log('⚠️ DEMO MODE: Password Reset Limitation');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📧 Email:', email);
        console.log('🔑 Attempted New Password Strength:', passwordValidation.strength);
        console.log('💪 Password Score:', passwordValidation.score);
        console.log('');
        console.log('❌ Cannot update Supabase Auth password in demo mode');
        console.log('💡 SOLUTION: Go to Supabase Dashboard manually:');
        console.log('   1. Open: https://supabase.com/dashboard');
        console.log('   2. Navigate to: Authentication > Users');
        console.log(`   3. Find user: ${email}`);
        console.log('   4. Click "..." > Reset Password');
        console.log('   5. Or use the production email flow');
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Clear the stored email
        localStorage.removeItem('demo_reset_email');
        
        setError('Demo mode: Password cannot be updated automatically. Please use Supabase Dashboard or production email flow.');
        setIsLoading(false);
        return;
        
        toast.success('Password updated successfully! 🎉');
        
        // Wait a moment then redirect to login
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
        return;
      }

      // 🌐 PRODUCTION MODE: Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || 'Failed to update password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success!
      toast.success('Password updated successfully! 🎉');
      
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Update password error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
          <p className="text-gray-600">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className={`text-xs font-medium text-${getStrengthColor(passwordValidation.strength)}-600`}>
                    {getStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 bg-${getStrengthColor(passwordValidation.strength)}-500`}
                    style={{ width: `${passwordValidation.score}%` }}
                  />
                </div>
                
                {/* Issues */}
                {passwordValidation.issues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordValidation.issues.map((issue, idx) => (
                      <p key={idx} className="text-xs text-red-600 flex items-center gap-1">
                        <span>•</span> {issue}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword && (
              <p className={`mt-1 text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Password Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use at least 8 characters</li>
            <li>• Mix uppercase and lowercase letters</li>
            <li>• Include numbers and special characters</li>
            <li>• Avoid common words or personal information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
