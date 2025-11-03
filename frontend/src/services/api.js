// ============= COMPLETE API SERVICE (src/services/api.js) =============
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ============= REQUEST INTERCEPTOR =============
// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============= RESPONSE INTERCEPTOR =============
// Handle common errors and responses
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Forbidden
      if (status === 403) {
        console.error('Access Denied:', data.message);
      }
      
      // Not Found
      if (status === 404) {
        console.error('Resource Not Found:', data.message);
      }
      
      // Server Error
      if (status >= 500) {
        console.error('Server Error:', data.message);
      }
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`API Error: ${status}`, data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Error in request setup
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============= AUTH API =============
export const authAPI = {
  // Register new user
  register: (data) => api.post('/auth/register', data),
  
  // Login user
  login: (data) => api.post('/auth/login', data),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Logout (client-side only - clear token)
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
  
  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ============= COURSE API =============
export const courseAPI = {
  getAll: (params = {}) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),  // ✅ Fixed
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/courses/${id}`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/courses/${id}`, data); 
  },
  delete: (id) => api.delete(`/courses/${id}`),  
  enroll: (id) => api.post(`/courses/${id}/enroll`), 
  unenroll: (id) => api.delete(`/courses/${id}/enroll`),  
  getEnrolled: () => api.get('/courses/enrolled'),
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  togglePublish: (id, isPublished) => 
    api.patch(`/courses/${id}/publish`, { isPublished }),  
  getStats: (id) => api.get(`/courses/${id}/stats`),  
  search: (query) => api.get('/courses', { params: { search: query } }),
  filterByCategory: (category) => api.get('/courses', { params: { category } }),
  filterByLevel: (level) => api.get('/courses', { params: { level } }),
};


// ============= LECTURE API =============
export const lectureAPI = {
  create: (formData, onProgress) => {
    
    return api.post('/lectures', formData, {
      headers: {
         'Content-Type': undefined, 
      },
      timeout: 600000, // 10 minutes
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  // Get all lectures for a course
  getCourseLectures: (courseId) => api.get(`/lectures/course/${courseId}`),
  
  // Get single lecture
  getById: (id) => api.get(`/lectures/${id}`),
  
  // Update lecture (instructor only)
  update: (id, data) => api.put(`/lectures/${id}`, data),
  
  // Delete lecture (instructor only)
  delete: (id) => api.delete(`/lectures/${id}`),
  
  // Reorder lectures (instructor only)
  reorder: (courseId, lectureIds) => 
    api.put(`/lectures/course/${courseId}/reorder`, { lectureIds }),
  
  // Mark lecture as watched (student only)
  markWatched: (id) => api.post(`/lectures/${id}/watch`),
};

export const assignmentAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'attachments' && Array.isArray(data[key])) {
          data[key].forEach(file => formData.append('attachments', file));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCourseAssignments: (courseId) => api.get(`/assignments/course/${courseId}`),  // ✅ Fixed
  getById: (id) => api.get(`/assignments/${id}`),  // ✅ Fixed
  update: (id, data) => api.put(`/assignments/${id}`, data),  // ✅ Fixed
  delete: (id) => api.delete(`/assignments/${id}`),  // ✅ Fixed
  getStats: (id) => api.get(`/assignments/${id}/stats`),  // ✅ Fixed
};

// ============= SUBMISSION API FIX =============
export const submissionAPI = {
  submit: (formData, onProgress) => {
    console.log('Submitting FormData:', formData);
    
    return api.post('/submissions', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
      timeout: 180000, // 3 minutes
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  getAssignmentSubmissions: (assignmentId) => 
    api.get(`/submissions/assignment/${assignmentId}`),
  
  getMySubmission: (assignmentId) => 
    api.get(`/submissions/my-submission/${assignmentId}`),
  
  getById: (id) => api.get(`/submissions/${id}`),
  
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  
  delete: (id) => api.delete(`/submissions/${id}`),
  
  resubmit: (id, formData) => {
    return api.put(`/submissions/${id}/resubmit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
  },
};

// ============= ADMIN API =============
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),  // ✅ Fixed
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),  // ✅ Fixed
  deleteUser: (id) => api.delete(`/admin/users/${id}`),  // ✅ Fixed
  getAllCourses: () => api.get('/admin/courses'),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),  // ✅ Fixed
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUserActivity: (userId) => api.get(`/admin/users/${userId}/activity`),  // ✅ Fixed
  toggleUserBan: (userId, banned) => 
    api.patch(`/admin/users/${userId}/ban`, { banned }),  // ✅ Fixed
  changeUserRole: (userId, role) => 
    api.patch(`/admin/users/${userId}/role`, { role }),  // ✅ Fixed
};

// ============= CHAT API =============
export const chatAPI = {
  getMessages: (courseId, params = {}) => 
    api.get(`/chat/${courseId}`, { params }),  // ✅ Fixed
  sendMessage: (courseId, content) => 
    api.post(`/chat/${courseId}`, { content }),  // ✅ Fixed
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),  // ✅ Fixed
  getStats: (courseId) => api.get(`/chat/${courseId}/stats`),  // ✅ Fixed
};

// ============= NOTIFICATION API (Optional - if implemented) =============
export const notificationAPI = {
  // Get all notifications
  getAll: () => api.get('/notifications'),
  
  // Get unread notifications
  getUnread: () => api.get('/notifications/unread'),
  
  // Mark notification as read
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Get notification count
  getCount: () => api.get('/notifications/count'),
};

// ============= PROGRESS API (Optional - if implemented) =============
export const progressAPI = {
  // Get course progress
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  
  // Update lecture progress
  updateLectureProgress: (lectureId, data) => 
    api.post(`/progress/lecture/${lectureId}`, data),
  
  // Get overall progress
  getOverallProgress: () => api.get('/progress/overall'),
  
  // Get progress statistics
  getStats: () => api.get('/progress/stats'),
};

// ============= REVIEW API (Optional - if implemented) =============
export const reviewAPI = {
  // Get course reviews
  getCourseReviews: (courseId) => api.get(`/reviews/course/${courseId}`),
  
  // Create review
  create: (data) => api.post('/reviews', data),
  
  // Update review
  update: (id, data) => api.put(`/reviews/${id}`, data),
  
  // Delete review
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Get average rating
  getAverageRating: (courseId) => api.get(`/reviews/course/${courseId}/rating`),
};

// ============= UTILITY FUNCTIONS =============

/**
 * Upload file with progress tracking
 */
export const uploadWithProgress = async (endpoint, formData, onProgress) => {
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 minutes
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (onProgress) {
        onProgress(percentCompleted);
      }
    },
  });
};

/**
 * Download file
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || 'download';
    link.click();
    window.URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Search courses with debounce
 */
export const searchCourses = (query, filters = {}) => {
  return courseAPI.getAll({ search: query, ...filters });
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (courseId) => {
  try {
    const { data } = await courseAPI.getEnrolled();
    return data.some(course => course._id === courseId);
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

/**
 * Get file size in readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  const fileType = file.type;
  return allowedTypes.some(type => {
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return fileType.startsWith(baseType);
    }
    return fileType === type;
  });
};

/**
 * Handle API errors consistently
 */
export const handleAPIError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    const errorMessages = {
      400: data.message || 'Bad request. Please check your input.',
      401: 'Unauthorized. Please login again.',
      403: 'You do not have permission to perform this action.',
      404: 'Resource not found.',
      409: data.message || 'Conflict. Resource already exists.',
      422: data.message || 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };
    
    return errorMessages[status] || data.message || 'An error occurred. Please try again.';
  } else if (error.request) {
    return 'No response from server. Please check your internet connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Retry failed requests
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

/**
 * Batch requests
 */
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req().catch(e => e)));
    results.push(...batchResults);
  }
  return results;
};

/**
 * Cancel token for aborting requests
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * Check if request was cancelled
 */
export const isCancel = (error) => {
  return axios.isCancel(error);
};

// Export axios instance for custom requests
export default api;