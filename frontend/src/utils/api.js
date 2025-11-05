import axios from 'axios';

const API_BASE_URL = '/api';

// Exams
export const getExams = () => axios.get(`${API_BASE_URL}/exams`);
export const getExam = (id) => axios.get(`${API_BASE_URL}/exams/${id}`);
export const createExam = (data) => axios.post(`${API_BASE_URL}/exams`, data);
export const updateExam = (id, data) => axios.put(`${API_BASE_URL}/exams/${id}`, data);
export const deleteExam = (id) => axios.delete(`${API_BASE_URL}/exams/${id}`);
export const togglePublishExam = (id) => axios.patch(`${API_BASE_URL}/exams/${id}/publish`);
export const getUpcomingExams = () => axios.get(`${API_BASE_URL}/exams/upcoming`);

// Questions
export const getQuestions = (params) => axios.get(`${API_BASE_URL}/questions`, { params });
export const getQuestion = (id) => axios.get(`${API_BASE_URL}/questions/${id}`);
export const createQuestion = (data) => axios.post(`${API_BASE_URL}/questions`, data);
export const updateQuestion = (id, data) => axios.put(`${API_BASE_URL}/questions/${id}`, data);
export const deleteQuestion = (id) => axios.delete(`${API_BASE_URL}/questions/${id}`);
export const bulkCreateQuestions = (data) => axios.post(`${API_BASE_URL}/questions/bulk`, data);
export const getSubjects = () => axios.get(`${API_BASE_URL}/questions/subjects`);
export const getTopicsBySubject = (subject) => axios.get(`${API_BASE_URL}/questions/topics/${subject}`);

// Exam Attempts
export const startExamAttempt = (examId) => axios.post(`${API_BASE_URL}/exam-attempts/start/${examId}`);
export const saveAnswer = (attemptId, data) => axios.put(`${API_BASE_URL}/exam-attempts/${attemptId}/answer`, data);
export const submitExam = (attemptId) => axios.post(`${API_BASE_URL}/exam-attempts/${attemptId}/submit`);
export const getMyAttempt = (examId) => axios.get(`${API_BASE_URL}/exam-attempts/my/${examId}`);
export const getMyAttempts = () => axios.get(`${API_BASE_URL}/exam-attempts/my-attempts`);
export const getExamAttempts = (examId) => axios.get(`${API_BASE_URL}/exam-attempts/exam/${examId}`);
export const evaluateAttempt = (attemptId, data) => axios.put(`${API_BASE_URL}/exam-attempts/${attemptId}/evaluate`, data);

// Users
export const getUsers = (params) => axios.get(`${API_BASE_URL}/users`, { params });
export const getUser = (id) => axios.get(`${API_BASE_URL}/users/${id}`);
export const updateUser = (id, data) => axios.put(`${API_BASE_URL}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API_BASE_URL}/users/${id}`);
export const toggleUserStatus = (id) => axios.patch(`${API_BASE_URL}/users/${id}/toggle-status`);
export const getStudentPerformance = (id) => axios.get(`${API_BASE_URL}/users/student/${id}/performance`);
export const updateProfile = (data) => axios.put(`${API_BASE_URL}/users/profile`, data);

// Notifications
export const getNotifications = (params) => axios.get(`${API_BASE_URL}/notifications`, { params });
export const markAsRead = (id) => axios.patch(`${API_BASE_URL}/notifications/${id}/read`);
export const markAllAsRead = () => axios.patch(`${API_BASE_URL}/notifications/read-all`);
export const deleteNotification = (id) => axios.delete(`${API_BASE_URL}/notifications/${id}`);
export const createNotification = (data) => axios.post(`${API_BASE_URL}/notifications`, data);

// Analytics
export const getDashboardStats = () => axios.get(`${API_BASE_URL}/analytics/dashboard`);
export const getExamAnalytics = (examId) => axios.get(`${API_BASE_URL}/analytics/exam/${examId}`);
export const getClassAnalytics = (params) => axios.get(`${API_BASE_URL}/analytics/class`, { params });

export default {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  togglePublishExam,
  getUpcomingExams,
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  getSubjects,
  getTopicsBySubject,
  startExamAttempt,
  saveAnswer,
  submitExam,
  getMyAttempt,
  getMyAttempts,
  getExamAttempts,
  evaluateAttempt,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getStudentPerformance,
  updateProfile,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getDashboardStats,
  getExamAnalytics,
  getClassAnalytics,
};
