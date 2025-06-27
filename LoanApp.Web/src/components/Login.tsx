import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginRequest {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use AuthContext login function

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Get success message from navigation state (from registration)
  const successMessage = location.state?.message;

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
            setApiError(errorData.message || 'Login failed');
          }
        } else if (response.status === 401) {
          setApiError('Invalid email or password');
        } else {
          const message = typeof errorData === 'string' ? errorData : errorData.message;
          setApiError(message || `Login failed (${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.token) {
        // Use AuthContext login instead of direct localStorage
        login(data.token);
        navigate('/', { 
          state: { message: 'Login successful! Welcome back.' }
        });
      } else {
        setApiError('No authentication token received');
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
          <h2 className="text-2xl font-semibold text-center">Sign In</h2>
          <p className="text-gray-400 text-center mt-2">Welcome back to LoanApp</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage && (
            <div className="bg-green-600 text-white p-3 rounded">
              {successMessage}
            </div>
          )}

          {apiError && (
            <div className="bg-red-600 text-white p-3 rounded">
              {apiError}
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
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Create one
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
