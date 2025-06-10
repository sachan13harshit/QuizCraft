import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, quizAPI, responseAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FaPlus, 
  FaPlay, 
  FaTrophy, 
  FaChartBar, 
  FaClock,
  FaUsers,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaFire
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    quizzes: [],
    responses: [],
    stats: {},
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    
    try {
      if (user?.role === 'creator') {
        const quizzesResponse = await quizAPI.getMyQuizzes();
        const quizzes = quizzesResponse.data.quizzes || [];
        
        // Calculate creator statistics
        let totalResponses = 0;
        let totalPercentage = 0;
        let totalQuizzesWithResponses = 0;
        
        for (const quiz of quizzes) {
          if (quiz.responseCount) {
            totalResponses += quiz.responseCount;
          }
          if (quiz.averagePercentage && quiz.responseCount > 0) {
            totalPercentage += quiz.averagePercentage;
            totalQuizzesWithResponses += 1;
          }
        }
        
        const averageScore = totalQuizzesWithResponses > 0 ? (totalPercentage / totalQuizzesWithResponses) : 0;
        
        // Load recent responses to creator's quizzes
        let recentResponses = [];
        try {
          for (const quiz of quizzes.slice(0, 3)) { // Get responses from first 3 quizzes to avoid too many API calls
            if (quiz.responseCount > 0) {
              const responsesResponse = await responseAPI.getQuizResponses(quiz.id, { limit: 5 });
              const quizResponses = responsesResponse.data.responses || [];
              // Add quiz info to each response
              recentResponses.push(...quizResponses.map(response => ({
                ...response,
                quizTitle: quiz.title
              })));
            }
          }
          // Sort by submission date and take most recent 5
          recentResponses = recentResponses
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

          // Fetch user details for each response
          const responsesWithUserData = await Promise.all(
            recentResponses.map(async (response) => {
              try {
                const userResponse = await authAPI.getUserById(response.userId);
                const userData = userResponse.data.user;
                return {
                  ...response,
                  userName: `${userData.firstName} ${userData.lastName}`
                };
              } catch (error) {
                console.error(`Failed to load user data for ${response.userId}:`, error);
                return {
                  ...response,
                  userName: `User ${response.userId?.slice(-6) || 'Unknown'}`
                };
              }
            })
          );
          
          recentResponses = responsesWithUserData;
        } catch (error) {
          console.error('Failed to load recent responses:', error);
          recentResponses = [];
        }
        
        setData({
          quizzes,
          responses: recentResponses,
          stats: {
            totalResponses,
            averageScore: averageScore.toFixed(1)
          },
          loading: false
        });
      } else {
        const responsesResponse = await responseAPI.getUserResponses();
        const availableQuizzesResponse = await quizAPI.getQuizzes();
        
        setData({
          quizzes: availableQuizzesResponse.data.quizzes || [],
          responses: responsesResponse.data.responses || [],
          stats: {},
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName} {user?.lastName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            {user?.role === 'creator' 
              ? 'Manage your quizzes and track performance' 
              : 'Discover new quizzes and track your progress'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'creator' ? (
            <>
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-xl p-3 mr-4">
                    <FaChartBar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{data.quizzes.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-xl p-3 mr-4">
                    <FaUsers className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.totalResponses || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-xl p-3 mr-4">
                    <FaStar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Score</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.averageScore || 0}%</p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-xl p-3 mr-4">
                    <FaFire className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.quizzes.filter(q => q.status === 'live').length}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-xl p-3 mr-4">
                    <FaCheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{data.responses.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-xl p-3 mr-4">
                    <FaTrophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.responses.length > 0 
                        ? Math.max(...data.responses.map(r => r.percentage || 0)).toFixed(0) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-xl p-3 mr-4">
                    <FaStar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.responses.length > 0 
                        ? (data.responses.reduce((acc, r) => acc + (r.percentage || 0), 0) / data.responses.length).toFixed(0) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card gradient shadow="lg" className="border-0">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-xl p-3 mr-4">
                    <FaPlay className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{data.quizzes.length}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Section */}
          <div className="lg:col-span-2 space-y-8">
            {user?.role === 'creator' ? (
              /* Creator's Quizzes */
              <Card shadow="lg" className="border-0">
                <Card.Header>
                  <div className="flex justify-between items-center">
                    <Card.Title>Your Quizzes</Card.Title>
                    <Link to="/create-quiz">
                      <Button>
                        <FaPlus className="mr-2" />
                        Create Quiz
                      </Button>
                    </Link>
                  </div>
                </Card.Header>
                
                <Card.Content>
                  {data.quizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FaChartBar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                      <p className="text-gray-500 mb-4">Create your first quiz to get started!</p>
                      <Link to="/create-quiz">
                        <Button>
                          <FaPlus className="mr-2" />
                          Create Your First Quiz
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{quiz.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  quiz.status === 'live' ? 'bg-green-100 text-green-800' :
                                  quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {quiz.status}
                                </span>
                                <span className="flex items-center">
                                  <FaClock className="mr-1" />
                                  {quiz.timeLimit} min
                                </span>
                                <span className="flex items-center">
                                  <FaUsers className="mr-1" />
                                  {quiz.responseCount || 0} responses
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/leaderboard/${quiz.id}`)}
                                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                              >
                                <FaTrophy className="mr-1" />
                                Leaderboard
                              </Button>
                              <Button size="sm" variant="ghost">
                                <FaEye />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <FaEdit />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            ) : (
              /* Available Quizzes for Takers */
              <Card shadow="lg" className="border-0">
                <Card.Header>
                  <Card.Title>Available Quizzes</Card.Title>
                </Card.Header>
                
                <Card.Content>
                  {data.quizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FaPlay className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                      <p className="text-gray-500">Check back later for new quizzes!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 hover:from-blue-100 hover:to-purple-100 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{quiz.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <FaClock className="mr-1" />
                                  {quiz.timeLimit} minutes
                                </span>
                                <span className="flex items-center">
                                  <FaUsers className="mr-1" />
                                  {quiz.responseCount || 0} attempts
                                </span>
                                <span>Created by {quiz.creator?.name}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/leaderboard/${quiz.id}`)}
                                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                              >
                                <FaTrophy className="mr-1" />
                                Leaderboard
                              </Button>
                              <Link to={`/quiz/${quiz.id}`}>
                                <Button>
                                  <FaPlay className="mr-2" />
                                  Start Quiz
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Responses - Only for Creators */}
            {user?.role === 'creator' && (
              <Card shadow="lg" className="border-0">
                <Card.Header>
                  <Card.Title>Recent Responses</Card.Title>
                </Card.Header>
                
                <Card.Content>
                  {data.responses.length === 0 ? (
                    <div className="text-center py-8">
                      <FaChartBar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No responses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.responses.slice(0, 5).map((response) => (
                        <div key={response.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {response.quizTitle || 'Unknown Quiz'}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {response.userName || `User ${response.userId?.slice(-6) || 'Unknown'}`} • {formatDate(response.submittedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${getScoreColor(response.score, response.totalPoints)}`}>
                              {response.score}/{response.totalPoints}
                            </p>
                            <p className="text-xs text-gray-500">
                              {response.percentage ? `${response.percentage.toFixed(0)}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Quick Actions */}
            <Card shadow="lg" className="border-0">
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-3">
                  {user?.role === 'creator' ? (
                    <Link to="/create-quiz">
                      <Button fullWidth variant="outline">
                        <FaPlus className="mr-2" />
                        Create New Quiz
                      </Button>
                    </Link>
                  ) : (
                    <Button fullWidth variant="outline" onClick={loadDashboardData}>
                      <FaClock className="mr-2" />
                      Refresh Quizzes
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 