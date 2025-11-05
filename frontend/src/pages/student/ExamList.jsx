import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaClock, FaCheckCircle } from 'react-icons/fa';
import { getExams, getMyAttempts } from '../../utils/api';
import { formatDateTime, getExamStatus, getStatusColor, formatDuration } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        getExams(),
        getMyAttempts(),
      ]);

      setExams(examsRes.data.exams);
      setAttempts(attemptsRes.data.attempts);
    } catch (error) {
      toast.error('Failed to load exams');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasAttempted = (examId) => {
    return attempts.some(attempt => attempt.exam._id === examId);
  };

  const getFilteredExams = () => {
    return exams.filter(exam => {
      const status = getExamStatus(exam.startTime, exam.endTime);
      if (filter === 'all') return true;
      return status === filter;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredExams = getFilteredExams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-2">View and take your exams</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'upcoming', 'ongoing', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Exams List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam.startTime, exam.endTime);
            const attempted = hasAttempted(exam._id);

            return (
              <div key={exam._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                      <span className={`badge ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      {attempted && (
                        <span className="badge badge-info">Attempted</span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{exam.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Subject:</span>
                        <p className="font-medium text-gray-900">{exam.subject}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium text-gray-900">{formatDuration(exam.duration)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Marks:</span>
                        <p className="font-medium text-gray-900">{exam.totalMarks}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Passing Marks:</span>
                        <p className="font-medium text-gray-900">{exam.passingMarks}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                      <span>📅 Start: {formatDateTime(exam.startTime)}</span>
                      <span>🏁 End: {formatDateTime(exam.endTime)}</span>
                    </div>

                    {exam.instructions && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Instructions:</strong> {exam.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {status === 'ongoing' && !attempted ? (
                      <Link
                        to={`/student/exam/${exam._id}`}
                        className="btn btn-primary"
                      >
                        Start Exam
                      </Link>
                    ) : status === 'upcoming' ? (
                      <button className="btn btn-secondary" disabled>
                        Not Started
                      </button>
                    ) : attempted ? (
                      <Link
                        to="/student/results"
                        className="btn btn-secondary"
                      >
                        View Result
                      </Link>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        Exam Ended
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaClipboardList size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No exams found</p>
        </div>
      )}
    </div>
  );
};

export default ExamList;
