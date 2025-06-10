import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  FaTrophy, 
  FaMedal,
  FaStar,
  FaClock,
  FaPercentage,
  FaHome,
  FaRedo,
  FaChartBar,
  FaCrown,
  FaAward
} from 'react-icons/fa';

const Leaderboard = () => {
  const { id } = useParams(); // quiz ID
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState({
    quiz: null,
    leaderboard: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    loadLeaderboard();
  }, [id]);

  const loadLeaderboard = async () => {
    try {
      const response = await quizAPI.getQuizLeaderboard(id);
      setData({
        quiz: response.data.quiz,
        leaderboard: response.data.leaderboard,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load leaderboard. Please try again.'
      }));
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaCrown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <FaMedal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <FaAward className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const isCurrentUser = (userId) => {
    return userId === user?.id;
  };

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{data.error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <FaTrophy className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600 text-lg">
            {data.quiz?.title || 'Quiz Leaderboard'}
          </p>
          <div className="flex justify-center items-center space-x-6 mt-4 text-sm text-gray-600">
            <span className="flex items-center">
              <FaChartBar className="mr-2" />
              {data.quiz?.totalQuestions} questions
            </span>
            <span className="flex items-center">
              <FaStar className="mr-2" />
              {data.quiz?.totalPoints} total points
            </span>
          </div>
        </div>

        {/* Leaderboard */}
        {data.leaderboard && data.leaderboard.length > 0 ? (
          <Card shadow="lg" className="border-0 mb-8">
            <Card.Header>
              <Card.Title className="flex items-center">
                <FaTrophy className="mr-2 text-yellow-500" />
                Top Performers
              </Card.Title>
            </Card.Header>
            
            <Card.Content>
              <div className="space-y-4">
                {data.leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const percentage = entry.percentage || 0;
                  
                  return (
                    <div 
                      key={entry.id || index} 
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${getRankColor(rank)} ${
                        isCurrentUser(entry.userId) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(rank)}
                          </div>
                          
                          <div>
                            <h3 className={`font-semibold ${isCurrentUser(entry.userId) ? 'text-blue-700' : 'text-gray-900'}`}>
                              {isCurrentUser(entry.userId) ? 'You' : `User ${entry.userId?.slice(-6) || 'Unknown'}`}
                              {isCurrentUser(entry.userId) && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Submitted on {new Date(entry.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-right">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <FaPercentage className="mr-1" />
                              Score
                            </div>
                            <div className={`text-lg font-bold ${
                              percentage >= 80 ? 'text-green-600' :
                              percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <FaStar className="mr-1" />
                              Points
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {entry.score}/{entry.totalPoints}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <FaClock className="mr-1" />
                              Time
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatTime(entry.timeTaken)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {rank <= 3 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-center space-x-2">
                            {rank === 1 && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                🏆 Champion
                              </span>
                            )}
                            {rank === 2 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                                🥈 Runner-up
                              </span>
                            )}
                            {rank === 3 && (
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                                🥉 Third Place
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        ) : (
          <Card shadow="lg" className="border-0 mb-8">
            <Card.Content>
              <div className="text-center py-12">
                <FaTrophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-500 mb-6">
                  Be the first to take this quiz and claim the top spot!
                </p>
                <Button 
                  onClick={() => navigate(`/quiz/${id}`)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Take Quiz
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            <FaHome className="mr-2" />
            Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate(`/quiz/${id}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <FaRedo className="mr-2" />
            Take Quiz
          </Button>
        </div>

        {/* Statistics */}
        <Card shadow="lg" className="border-0 mt-8">
          <Card.Header>
            <Card.Title>Quiz Statistics</Card.Title>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <FaChartBar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.leaderboard?.length || 0}
                </p>
              </div>
              
              <div>
                <FaStar className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.leaderboard?.length > 0 
                    ? `${data.leaderboard[0].percentage?.toFixed(1) || 0}%` 
                    : '0%'
                  }
                </p>
              </div>
              
              <div>
                <FaClock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Fastest Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.leaderboard?.length > 0 
                    ? formatTime(Math.min(...data.leaderboard.map(entry => entry.timeTaken || 0).filter(t => t > 0)))
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard; 