const API_CONFIG = {
  AUTH_SERVICE: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  QUIZ_SERVICE: import.meta.env.VITE_QUIZ_SERVICE_URL || 'http://localhost:3002'
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(options.includeAuth !== false),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth Service API calls
export const authAPI = {
  // Register a new user
  signup: async (userData) => {
    return makeRequest(`${API_CONFIG.AUTH_SERVICE}/auth/signup`, {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify(userData)
    });
  },

  // Login user
  login: async (credentials) => {
    return makeRequest(`${API_CONFIG.AUTH_SERVICE}/auth/login`, {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify(credentials)
    });
  },

  // Get current user profile
  getProfile: async () => {
    return makeRequest(`${API_CONFIG.AUTH_SERVICE}/auth/me`);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return makeRequest(`${API_CONFIG.AUTH_SERVICE}/auth/me`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Get user by ID
  getUserById: async (userId) => {
    return makeRequest(`${API_CONFIG.AUTH_SERVICE}/auth/users/${userId}`);
  }
};

// Quiz Service API calls
export const quizAPI = {
  // Get all quizzes
  getQuizzes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.QUIZ_SERVICE}/quizzes${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  // Get user's own quizzes
  getMyQuizzes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.QUIZ_SERVICE}/quizzes/my-quizzes${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes/${id}`);
  },

  // Create new quiz
  createQuiz: async (quizData) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes/${id}`, {
      method: 'DELETE'
    });
  },

  // Get quiz statistics
  getQuizStatistics: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes/${id}/statistics`);
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (id, limit = 10) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/quizzes/${id}/leaderboard?limit=${limit}`);
  }
};

// Question API calls
export const questionAPI = {
  // Get questions for a quiz
  getQuestions: async (quizId) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/quiz/${quizId}`);
  },

  // Get question by ID
  getQuestionById: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/${id}`);
  },

  // Add question to quiz
  addQuestion: async (quizId, questionData) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/quiz/${quizId}`, {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  },

  // Delete question
  deleteQuestion: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/${id}`, {
      method: 'DELETE'
    });
  },

  // Reorder questions
  reorderQuestions: async (quizId, questionOrders) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/questions/quiz/${quizId}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ questionOrders })
    });
  }
};

// Response API calls
export const responseAPI = {
  // Submit quiz response
  submitQuizResponse: async (quizId, responseData) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/responses/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  },

  // Get user's response to a quiz
  getUserQuizResponse: async (quizId) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/responses/quiz/${quizId}/my-response`);
  },

  // Get all responses for a quiz (for creators)
  getQuizResponses: async (quizId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.QUIZ_SERVICE}/responses/quiz/${quizId}${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  // Get user's all responses
  getUserResponses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.QUIZ_SERVICE}/responses/my-responses${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  // Get response by ID
  getResponseById: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/responses/${id}`);
  },

  // Get detailed response
  getResponseDetail: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/responses/${id}`);
  },

  // Delete response
  deleteResponse: async (id) => {
    return makeRequest(`${API_CONFIG.QUIZ_SERVICE}/responses/${id}`, {
      method: 'DELETE'
    });
  }
};

// Auth utilities
export const authUtils = {
  // Store auth token
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  // Remove auth token
  removeAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get stored user data
  getStoredUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Store user data
  setStoredUser: (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  // Remove stored user data
  removeStoredUser: () => {
    localStorage.removeItem('userData');
  },

  // Clear all auth data
  clearAuthData: () => {
    authUtils.removeAuthToken();
    authUtils.removeStoredUser();
  }
}; 