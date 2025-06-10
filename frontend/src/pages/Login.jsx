import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { 
  FaEnvelope, 
  FaLock, 
  FaBrain,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';

const Login = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-lg">
              <FaBrain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to QuizCraft
          </h2>
          <p className="text-gray-600">
            Or <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">create a new account</Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-800 text-sm font-medium">
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <Card padding="lg" shadow="lg" className="border-0 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={formErrors.email}
              icon={<FaEnvelope />}
              required
            />

            {/* Password Input */}
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={formErrors.password}
              icon={<FaLock />}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <FaSignInAlt className="mr-2" />
              Sign in
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <FaUserPlus className="inline mr-1" />
                Create one here
              </Link>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🎯 Interactive Quizzes • 🏆 Leaderboards • 📊 Real-time Results
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 