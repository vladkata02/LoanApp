import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { code } = useParams<{ code?: string }>();
  
  // Check if this is an invite registration by looking for code parameter
  const inviteCode = code;
  const isInviteRegistration = !!inviteCode;

  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (isInviteRegistration && !inviteCode) {
      newErrors.inviteCode = 'Invitation code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isInviteRegistration 
        ? `${apiUrl}/api/auth/register/${inviteCode}`
        : `${apiUrl}/api/auth/register`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          errorData = await response.text().catch(() => '');
        }

        if (response.status === 400) {
          if (typeof errorData === 'string') {
            setApiError(errorData);
          } else if (errorData.errors) {
            const backendErrors: ValidationErrors = {};
            Object.keys(errorData.errors).forEach(key => {
              const fieldKey = key.toLowerCase() as keyof ValidationErrors;
              if (errorData.errors[key] && errorData.errors[key].length > 0) {
                backendErrors[fieldKey] = errorData.errors[key][0];
              }
            });
            setErrors(backendErrors);
          } else {
            setApiError(errorData.message || 'Registration failed');
          }
        } else if (response.status === 409) {
          setApiError('User with this email already exists');
        } else if (response.status === 401 && isInviteRegistration) {
          setApiError('Invalid or expired invitation code');
        } else {
          const message = typeof errorData === 'string' ? errorData : errorData.message;
          setApiError(message || `Registration failed (${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.token) {
        login(data.token);
        navigate('/', { 
          state: { 
            message: isInviteRegistration 
              ? 'Account created successfully with invitation! Welcome!' 
              : 'Account created successfully! Welcome!' 
          } 
        });
      } else {
        navigate('/login', { 
          state: { 
            message: isInviteRegistration 
              ? 'Account created successfully with invitation! Please log in.' 
              : 'Account created successfully! Please log in.' 
          } 
        });
      }

    } catch (error: any) {
      setApiError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-center">
            {isInviteRegistration ? 'Register with Invitation' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-center mt-2">
            {isInviteRegistration 
              ? 'Complete your registration using the invitation code' 
              : 'Fill in your details to create an account'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-600 text-white p-3 rounded">
              {apiError}
            </div>
          )}

          {isInviteRegistration && (
            <div>
              <label className="block mb-2 font-medium" htmlFor="inviteCode">
                Invitation Code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-gray-400"
                value={inviteCode || ''}
                placeholder="Invitation code from URL"
                readOnly
              />
              {errors.inviteCode && (
                <p className="text-red-500 text-sm mt-1">{errors.inviteCode}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                This code was provided in your invitation link.
              </p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full p-3 rounded bg-gray-700 border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } focus:border-indigo-500 outline-none`}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium" htmlFor="password">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`w-full p-3 rounded bg-gray-700 border ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } focus:border-indigo-500 outline-none`}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium" htmlFor="confirmPassword">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`w-full p-3 rounded bg-gray-700 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              } focus:border-indigo-500 outline-none`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
