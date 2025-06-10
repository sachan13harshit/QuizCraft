import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaBrain,
  FaRocket
} from 'react-icons/fa';

const Signup = () => {
  const { signup, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'taker'
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
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
    
    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
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
            Join QuizCraft
          </h2>
          <p className="text-gray-600">
            Create your account and start your quiz journey
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

        {/* Signup Form */}
        <Card padding="lg" shadow="lg" className="border-0 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'taker' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'taker'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUserGraduate className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Quiz Taker</div>
                  <div className="text-xs text-gray-500">Take quizzes & compete</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'creator' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'creator'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaChalkboardTeacher className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Quiz Creator</div>
                  <div className="text-xs text-gray-500">Create & manage quizzes</div>
                </button>
              </div>
            </div>

            {/* Name Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                error={formErrors.firstName}
                icon={<FaUser />}
                required
              />
              
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                error={formErrors.lastName}
                icon={<FaUser />}
                required
              />
            </div>

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
              placeholder="Create a password"
              error={formErrors.password}
              icon={<FaLock />}
              required
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={formErrors.confirmPassword}
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
              <FaRocket className="mr-2" />
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
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

export default Signup; 