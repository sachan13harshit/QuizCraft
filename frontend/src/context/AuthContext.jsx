import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, authUtils } from '../services/api';

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authUtils.isAuthenticated()) {
          const response = await authAPI.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user: response.data.user }
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user: null }
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        authUtils.clearAuthData();
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: { user: null }
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      authUtils.setAuthToken(token);
      authUtils.setStoredUser(user);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SIGNUP_START });
    
    try {
      const response = await authAPI.signup(userData);
      const { token, user } = response.data;
      
      authUtils.setAuthToken(token);
      authUtils.setStoredUser(user);
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: { user }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authUtils.clearAuthData();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 