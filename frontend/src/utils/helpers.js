import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
  return format(new Date(date), formatStr);
};

// Format date time
export const formatDateTime = (date) => {
  return format(new Date(date), 'PPP p');
};

// Get relative time
export const getRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Check if exam is upcoming
export const isExamUpcoming = (startTime) => {
  return isFuture(new Date(startTime));
};

// Check if exam is past
export const isExamPast = (endTime) => {
  return isPast(new Date(endTime));
};

// Check if exam is ongoing
export const isExamOngoing = (startTime, endTime) => {
  const now = new Date();
  return isPast(new Date(startTime)) && isFuture(new Date(endTime));
};

// Get exam status
export const getExamStatus = (startTime, endTime) => {
  if (isExamUpcoming(startTime)) return 'upcoming';
  if (isExamOngoing(startTime, endTime)) return 'ongoing';
  if (isExamPast(endTime)) return 'completed';
  return 'unknown';
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Calculate percentage
export const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return ((obtained / total) * 100).toFixed(2);
};

// Get grade from percentage
export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    'upcoming': 'badge-info',
    'ongoing': 'badge-warning',
    'completed': 'badge-success',
    'in-progress': 'badge-warning',
    'submitted': 'badge-info',
    'evaluated': 'badge-success',
    'abandoned': 'badge-danger',
    'passed': 'badge-success',
    'failed': 'badge-danger',
  };
  return colors[status] || 'badge-info';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Shuffle array (for randomizing questions)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Format time remaining
export const formatTimeRemaining = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  formatDate,
  formatDateTime,
  getRelativeTime,
  isExamUpcoming,
  isExamPast,
  isExamOngoing,
  getExamStatus,
  formatDuration,
  calculatePercentage,
  getGrade,
  getStatusColor,
  truncateText,
  isValidEmail,
  getInitials,
  shuffleArray,
  formatTimeRemaining,
  debounce,
};
