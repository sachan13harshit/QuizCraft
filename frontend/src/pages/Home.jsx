import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  FaBrain, 
  FaTrophy, 
  FaClock, 
  FaUsers,
  FaChartBar,
  FaRocket,
  FaPlay,
  FaPlus,
  FaMobile,
  FaLaptop,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <FaBrain className="h-8 w-8" />,
      title: "Smart Quiz Creation",
      description: "Create engaging quizzes with multiple question types, time limits, and advanced scoring systems.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <FaTrophy className="h-8 w-8" />,
      title: "Real-time Leaderboards",
      description: "Compete with others and track your progress with dynamic leaderboards and rankings.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaChartBar className="h-8 w-8" />,
      title: "Detailed Analytics",
      description: "Get comprehensive insights with performance statistics, response patterns, and progress tracking.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <FaClock className="h-8 w-8" />,
      title: "Timed Challenges",
      description: "Add excitement with customizable time limits and automatic scoring for competitive quizzes.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <FaUsers className="h-8 w-8" />,
      title: "Multi-User Support",
      description: "Support for quiz creators and takers with role-based permissions and collaborative features.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Built with security in mind, featuring user authentication and data protection measures.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { label: "Quiz Types", value: "3+", icon: <FaBrain /> },
    { label: "Real-time", value: "100%", icon: <FaBolt /> },
    { label: "Mobile Ready", value: "✓", icon: <FaMobile /> },
    { label: "Cross Platform", value: "✓", icon: <FaLaptop /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Logo Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <FaBrain className="h-16 w-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✨</span>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Quiz Platform
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Create, share, and participate in interactive quizzes with real-time scoring, 
              leaderboards, and comprehensive analytics. Perfect for education, training, and fun competitions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard">
                    <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <FaPlay className="mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  {user?.role === 'creator' && (
                    <Link to="/create-quiz">
                      <Button size="xl" variant="outline">
                        <FaPlus className="mr-2" />
                        Create Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <FaRocket className="mr-2" />
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="xl" variant="outline">
                      <FaPlay className="mr-2" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center">
                    <span className="mr-1">{stat.icon}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Modern Quizzing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create engaging quizzes and track performance 
              with our comprehensive suite of tools and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 hover:scale-105 transition-all duration-300" 
                shadow="xl"
                padding="lg"
              >
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${feature.color} rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500"></div>
        
        <div className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-3">
                    <FaBrain className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-white">QuizCraft</span>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Building the future of interactive learning and assessment with innovative quiz solutions.
                </p>
              </div>

              {/* Features Section */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-6">Features</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center justify-center md:justify-start">
                    <FaBrain className="mr-2 text-yellow-300" />
                    Smart Quiz Creation
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaTrophy className="mr-2 text-yellow-300" />
                    Real-time Leaderboards
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaChartBar className="mr-2 text-yellow-300" />
                    Detailed Analytics
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaClock className="mr-2 text-yellow-300" />
                    Timed Challenges
                  </li>
                </ul>
              </div>

              {/* Platform Section */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-6">Platform</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center justify-center md:justify-start">
                    <FaUsers className="mr-2 text-cyan-300" />
                    Multi-User Support
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaMobile className="mr-2 text-cyan-300" />
                    Mobile Responsive
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaShieldAlt className="mr-2 text-cyan-300" />
                    Secure & Reliable
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaBolt className="mr-2 text-cyan-300" />
                    Real-time Updates
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/20 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-white/90 text-sm mb-4 md:mb-0">
                  © 2025 QuizCraft. Made with <span className="text-red-400">❤️</span> for better learning experiences.
                </div>
                <div className="flex space-x-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors">
                    <FaBrain className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors">
                    <FaTrophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors">
                    <FaRocket className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 translate-y-16"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 -translate-y-24"></div>
      </footer>
    </div>
  );
};

export default Home; 