import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, questionAPI, responseAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  FaClock, 
  FaQuestionCircle, 
  FaCheck, 
  FaTimes, 
  FaArrowRight,
  FaArrowLeft,
  FaPlay,
  FaStop,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, quizCompleted]);

  const loadQuiz = async () => {
    try {
      const response = await quizAPI.getQuizById(id);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions || []);
      
      if (response.data.quiz.timeLimit) {
        setTimeLeft(response.data.quiz.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const responseData = {
        answers,
        startTime: startTime?.toISOString()
      };
      
      const response = await responseAPI.submitQuizResponse(id, responseData);
      setQuizCompleted(true);
      
      // Navigate to results page after a short delay
      setTimeout(() => {
        if (response?.data?.response?.id) {
          navigate(`/quiz-results/${response.data.response.id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <FaQuestionCircle />;
      case 'true_false': return <FaCheck />;
      case 'short_answer': return <FaQuestionCircle />;
      default: return <FaQuestionCircle />;
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredQuestions = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been submitted successfully. Redirecting to dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card shadow="lg" className="border-0">
            <Card.Header>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz?.title}</h1>
                <p className="text-gray-600">{quiz?.description}</p>
              </div>
            </Card.Header>
            
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-4 mb-2">
                    <FaQuestionCircle className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                  <p className="text-gray-600">{questions.length} questions</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-100 rounded-xl p-4 mb-2">
                    <FaClock className="h-8 w-8 text-orange-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Time Limit</h3>
                  <p className="text-gray-600">
                    {quiz?.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-xl p-4 mb-2">
                    <FaCheck className="h-8 w-8 text-green-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Attempts</h3>
                  <p className="text-gray-600">{quiz?.maxAttempts} attempt(s)</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <FaPlay className="mr-2" />
                  Start Quiz
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz?.title}</h1>
            {quiz?.timeLimit && (
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <FaClock className={timeLeft < 300 ? 'text-red-500' : 'text-gray-600'} />
                <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-600'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{answeredQuestions} of {questions.length} answered</span>
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <Card shadow="lg" className="border-0 mb-6">
            <Card.Content>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 rounded-lg p-2">
                  {getQuestionTypeIcon(currentQuestion.type)}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
              </div>
              
              <p className="text-lg text-gray-800 mb-6">{currentQuestion.content}</p>
              
              {/* Question Options */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                    <label key={key} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={value}
                        checked={answers[currentQuestion.id] === value}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="text-blue-600 mr-3"
                      />
                      <span className="text-gray-800">{value}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value="true"
                      checked={answers[currentQuestion.id] === 'true'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="text-green-600 mr-3"
                    />
                    <FaCheck className="text-green-600 mr-2" />
                    <span className="text-gray-800">True</span>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value="false"
                      checked={answers[currentQuestion.id] === 'false'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="text-red-600 mr-3"
                    />
                    <FaTimes className="text-red-600 mr-2" />
                    <span className="text-gray-800">False</span>
                  </label>
                </div>
              )}

              {currentQuestion.type === 'short_answer' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              )}
            </Card.Content>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                loading={submitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <FaStop className="mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Next
                <FaArrowRight className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;