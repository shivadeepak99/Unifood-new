/**
 * Password Strength Validator
 * Validates password strength and provides feedback
 */

export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 6) {
    issues.push('Password must be at least 6 characters long');
    suggestions.push('Add more characters to make it longer');
  } else if (password.length >= 6 && password.length < 8) {
    score += 20;
    suggestions.push('Consider making it at least 8 characters for better security');
  } else if (password.length >= 8 && password.length < 12) {
    score += 30;
  } else {
    score += 40;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    issues.push('Add at least one uppercase letter');
    suggestions.push('Include uppercase letters (A-Z)');
  } else {
    score += 15;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    issues.push('Add at least one lowercase letter');
    suggestions.push('Include lowercase letters (a-z)');
  } else {
    score += 15;
  }

  // Number check
  if (!/\d/.test(password)) {
    issues.push('Add at least one number');
    suggestions.push('Include numbers (0-9)');
  } else {
    score += 15;
  }

  // Special character check (optional but recommended)
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    suggestions.push('Consider adding special characters (!@#$%^&*)');
  } else {
    score += 15;
  }

  // Common password check
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push('This password is too common');
    suggestions.push('Avoid common passwords like "password" or "123456"');
    score = Math.min(score, 20);
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'fair';
  } else if (score < 80) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  // Must have no issues to be valid
  const isValid = issues.length === 0;

  return {
    isValid,
    strength,
    score,
    issues,
    suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
  };
};

export const getStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'weak':
      return 'red';
    case 'fair':
      return 'orange';
    case 'strong':
      return 'green';
    case 'very-strong':
      return 'blue';
    default:
      return 'gray';
  }
};

export const getStrengthText = (strength: string): string => {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'strong':
      return 'Strong';
    case 'very-strong':
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};
