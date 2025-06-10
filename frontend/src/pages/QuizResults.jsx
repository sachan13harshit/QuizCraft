import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { responseAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  FaTrophy, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaPercentage,
  FaStar,
  FaHome,
  FaRedo,
  FaChartBar
} from 'react-icons/fa';

const QuizResults = () => {
  const { id } = useParams(); // response ID
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const result = await responseAPI.getResponseById(id);
      setResponse(result.data.response);
    } catch (error) {
      console.error('Failed to load results:', error);
      setError('Failed to load quiz results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the quiz results you're looking for.</p>
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
            {response.percentage >= 80 ? (
              <FaTrophy className="h-16 w-16 text-yellow-500 mx-auto" />
            ) : response.percentage >= 60 ? (
              <FaStar className="h-16 w-16 text-blue-500 mx-auto" />
            ) : (
              <FaChartBar className="h-16 w-16 text-gray-500 mx-auto" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600 text-lg">
            {response.quizId?.title || 'Quiz Completed'}
          </p>
        </div>

        {/* Score Overview */}
        <Card shadow="lg" className="border-0 mb-8">
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(response.percentage)}`}>
                  {response.percentage?.toFixed(1) || 0}%
                </div>
                <p className="text-gray-600">Overall Score</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {response.score || 0}/{response.totalPoints || 0}
                </div>
                <p className="text-gray-600">Points Earned</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatTime(response.timeTaken)}
                </div>
                <p className="text-gray-600">Time Taken</p>
              </div>
              
              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getScoreBadgeColor(response.percentage)}`}>
                  {response.percentage >= 80 ? '🏆 Excellent' :
                   response.percentage >= 60 ? '👍 Good' : '📚 Needs Practice'}
                </div>
                <p className="text-gray-600 mt-2">Performance</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Detailed Feedback */}
        {response.feedback && response.feedback.length > 0 && (
          <Card shadow="lg" className="border-0 mb-8">
            <Card.Header>
              <Card.Title>Question by Question Breakdown</Card.Title>
            </Card.Header>
            
            <Card.Content>
              <div className="space-y-6">
                {response.feedback.map((item, index) => (
                  <div key={item.questionId || index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {item.isCorrect ? (
                          <FaCheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <FaTimesCircle className="h-6 w-6 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          {item.points || 0} pts
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Your Answer:</span>
                        <p className={`mt-1 ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {item.userAnswer || 'No answer provided'}
                        </p>
                      </div>
                      
                      {!item.isCorrect && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                          <p className="mt-1 text-green-700">{item.correctAnswer}</p>
                        </div>
                      )}
                      
                      {item.explanation && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Explanation:</span>
                          <p className="mt-1 text-gray-600">{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
            Back to Dashboard
          </Button>
          
          {response.quizId && (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate(`/leaderboard/${response.quizId.id || response.quizId}`)}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <FaTrophy className="mr-2" />
                View Leaderboard
              </Button>
              
              <Button 
                onClick={() => navigate(`/quiz/${response.quizId.id || response.quizId}`)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <FaRedo className="mr-2" />
                Retake Quiz
              </Button>
            </>
          )}
        </div>
        
        {/* Additional Stats */}
        <Card shadow="lg" className="border-0 mt-8">
          <Card.Header>
            <Card.Title>Quiz Statistics</Card.Title>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <FaClock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Submitted At</p>
                <p className="font-semibold text-gray-900">
                  {new Date(response.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <FaPercentage className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="font-semibold text-gray-900">
                  {response.feedback ? 
                    `${response.feedback.filter(f => f.isCorrect).length}/${response.feedback.length} correct` :
                    'N/A'
                  }
                </p>
              </div>
              
              <div>
                <FaChartBar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">
                  {response.isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults; 