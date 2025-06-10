import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI, questionAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaClock, 
  FaGlobe,
  FaLock,
  FaQuestionCircle,
  FaCheck,
  FaTimes,
  FaEdit,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    isPublic: true,
    maxAttempts: 1,
    status: 'draft'
  });
  
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    }
  ]);

  const [errors, setErrors] = useState({});

  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, [field]: value }
        : q
    ));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : q
    ));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const moveQuestion = (questionId, direction) => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      const newQuestions = [...questions];
      [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
      setQuestions(newQuestions);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!quizData.title.trim()) {
      newErrors.title = 'Quiz title is required';
    }
    
    if (!quizData.description.trim()) {
      newErrors.description = 'Quiz description is required';
    }
    
    if (quizData.timeLimit < 1) {
      newErrors.timeLimit = 'Time limit must be at least 1 minute';
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${question.id}`] = `Question ${index + 1} text is required`;
      }
      
      if (question.type === 'multiple_choice') {
        const validOptions = question.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          newErrors[`options_${question.id}`] = `Question ${index + 1} needs at least 2 options`;
        }
        
        if (!question.options[question.correctAnswer]?.trim()) {
          newErrors[`correct_${question.id}`] = `Question ${index + 1} correct answer is invalid`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create quiz
      const quizResponse = await quizAPI.createQuiz({
        ...quizData,
        status
      });
      
      const quizId = quizResponse.data.quiz.id;
      
      // Create questions
      for (let index = 0; index < questions.length; index++) {
        const question = questions[index];
        
        // Map frontend question types to backend types
        const typeMapping = {
          'multiple_choice': 'mcq',
          'true_false': 'true_false',
          'short_answer': 'short_answer'
        };

        // Process options and correct answer for multiple choice
        let processedOptions = [];
        let correctAnswer = question.correctAnswer;
        
        if (question.type === 'multiple_choice') {
          // Filter out empty options and create a clean options array
          processedOptions = question.options.filter(opt => opt.trim());
          
          // Make sure the correct answer index is valid and get the actual text
          if (typeof question.correctAnswer === 'number' && 
              question.correctAnswer >= 0 && 
              question.correctAnswer < processedOptions.length) {
            correctAnswer = processedOptions[question.correctAnswer];
          } else {
            // Fallback to first option if invalid index
            correctAnswer = processedOptions[0] || '';
          }
        }

        const questionData = {
          type: typeMapping[question.type] || question.type,
          content: question.question,
          correctAnswer: correctAnswer,
          explanation: question.explanation,
          points: question.points,
          orderIndex: index
        };
        
        if (question.type === 'multiple_choice') {
          // Convert options array to object where each option text is both key and value
          // This matches the backend expectation for Map validation
          const optionsObj = {};
          processedOptions.forEach((option) => {
            optionsObj[option] = option;
          });
          questionData.options = optionsObj;
        }
        
        await questionAPI.addQuestion(quizId, questionData);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create quiz' });
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return <FaQuestionCircle />;
      case 'true_false': return <FaCheck />;
      case 'short_answer': return <FaEdit />;
      default: return <FaQuestionCircle />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Quiz ✨
          </h1>
          <p className="text-gray-600 text-lg">
            Design an engaging quiz with custom questions and interactive elements
          </p>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-red-800 text-sm font-medium">
              {errors.submit}
            </div>
          </div>
        )}

        {/* Quiz Settings */}
        <Card shadow="lg" className="border-0 mb-8">
          <Card.Header>
            <Card.Title>Quiz Settings</Card.Title>
          </Card.Header>
          
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Quiz Title"
                value={quizData.title}
                onChange={(e) => handleQuizChange('title', e.target.value)}
                placeholder="Enter quiz title"
                error={errors.title}
                required
              />
              
              <Input
                label="Time Limit (minutes)"
                type="number"
                value={quizData.timeLimit}
                onChange={(e) => handleQuizChange('timeLimit', parseInt(e.target.value))}
                placeholder="30"
                error={errors.timeLimit}
                icon={<FaClock />}
                required
              />
            </div>
            
            <div className="mt-6">
              <Input
                label="Description"
                value={quizData.description}
                onChange={(e) => handleQuizChange('description', e.target.value)}
                placeholder="Brief description of your quiz"
                error={errors.description}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quiz Visibility
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuizChange('isPublic', true)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      quizData.isPublic
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaGlobe className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Public</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleQuizChange('isPublic', false)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      !quizData.isPublic
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaLock className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Private</div>
                  </button>
                </div>
              </div>

              <Input
                label="Max Attempts"
                type="number"
                value={quizData.maxAttempts}
                onChange={(e) => handleQuizChange('maxAttempts', parseInt(e.target.value))}
                placeholder="1"
                min="1"
              />
            </div>
          </Card.Content>
        </Card>

        {/* Questions */}
        <Card shadow="lg" className="border-0 mb-8">
          <Card.Header>
            <div className="flex justify-between items-center">
              <Card.Title>Questions ({questions.length})</Card.Title>
              <Button onClick={addQuestion} size="sm">
                <FaPlus className="mr-2" />
                Add Question
              </Button>
            </div>
          </Card.Header>
          
          <Card.Content>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 rounded-lg p-2">
                        {getQuestionTypeIcon(question.type)}
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        Question {index + 1}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                      >
                        <FaArrowUp />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        <FaArrowDown />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => removeQuestion(question.id)}
                        disabled={questions.length === 1}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Question Text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                        placeholder="Enter your question"
                        error={errors[`question_${question.id}`]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Options */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct_${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleQuestionChange(question.id, 'correctAnswer', optionIndex)}
                            className="text-blue-600"
                          />
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      {errors[`options_${question.id}`] && (
                        <p className="text-red-600 text-sm">{errors[`options_${question.id}`]}</p>
                      )}
                    </div>
                  )}

                  {question.type === 'true_false' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Correct Answer
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`tf_${question.id}`}
                            checked={question.correctAnswer === true}
                            onChange={() => handleQuestionChange(question.id, 'correctAnswer', true)}
                            className="text-green-600 mr-2"
                          />
                          <span className="flex items-center">
                            <FaCheck className="text-green-600 mr-1" />
                            True
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`tf_${question.id}`}
                            checked={question.correctAnswer === false}
                            onChange={() => handleQuestionChange(question.id, 'correctAnswer', false)}
                            className="text-red-600 mr-2"
                          />
                          <span className="flex items-center">
                            <FaTimes className="text-red-600 mr-1" />
                            False
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <Input
                      label="Correct Answer"
                      value={question.correctAnswer}
                      onChange={(e) => handleQuestionChange(question.id, 'correctAnswer', e.target.value)}
                      placeholder="Enter the correct answer"
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="md:col-span-3">
                      <Input
                        label="Explanation (Optional)"
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer"
                      />
                    </div>
                    <Input
                      label="Points"
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSubmit('draft')}
            loading={loading}
            disabled={loading}
          >
            <FaSave className="mr-2" />
            Save as Draft
          </Button>
          
          <Button
            size="lg"
            onClick={() => handleSubmit('live')}
            loading={loading}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <FaGlobe className="mr-2" />
            Publish Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz; 