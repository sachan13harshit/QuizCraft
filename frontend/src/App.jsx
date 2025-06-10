import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import Leaderboard from './pages/Leaderboard';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading QuizCraft...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// App Content Component
const AppContent = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={<Home />} 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Creator Only Routes */}
          <Route 
            path="/create-quiz" 
            element={
              <ProtectedRoute requiredRole="creator">
                <CreateQuiz />
              </ProtectedRoute>
            } 
          />
          
          {/* Quiz Taking Route */}
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            } 
          />
          
          {/* Quiz Results Route */}
          <Route 
            path="/quiz-results/:id" 
            element={
              <ProtectedRoute>
                <QuizResults />
              </ProtectedRoute>
            } 
          />
          
          {/* Leaderboard Route */}
          <Route 
            path="/leaderboard/:id" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-600 mb-6">
                      Sorry, we couldn't find the page you're looking for.
                    </p>
                    <a 
                      href="/"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
