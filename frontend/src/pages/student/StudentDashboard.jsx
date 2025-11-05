import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaChartBar, FaClock, FaTrophy } from 'react-icons/fa';
import StatCard from '../../components/StatCard';
import { getDashboardStats, getUpcomingExams, getMyAttempts } from '../../utils/api';
import { formatDateTime, getExamStatus, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, upcomingRes, attemptsRes] = await Promise.all([
        getDashboardStats(),
        getUpcomingExams(),
        getMyAttempts(),
      ]);

      setStats(statsRes.data.stats);
      setUpcomingExams(upcomingRes.data.exams);
      setRecentResults(attemptsRes.data.attempts.filter(a => a.status === 'evaluated').slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Exams"
          value={stats?.totalExams || 0}
          icon={FaClipboardList}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats?.completedExams || 0}
          icon={FaChartBar}
          color="success"
        />
        <StatCard
          title="Upcoming"
          value={stats?.upcomingExams || 0}
          icon={FaClock}
          color="warning"
        />
        <StatCard
          title="Average Score"
          value={`${stats?.averageScore || 0}%`}
          icon={FaTrophy}
          color="info"
        />
      </div>

      {/* Upcoming Exams */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Exams</h2>
          <Link to="/student/exams" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {upcomingExams.length > 0 ? (
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <div
                key={exam._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>📅 {formatDateTime(exam.startTime)}</span>
                    <span>⏱️ {exam.duration} minutes</span>
                    <span>📊 {exam.totalMarks} marks</span>
                  </div>
                </div>
                <Link
                  to={`/student/exams`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No upcoming exams</p>
          </div>
        )}
      </div>

      {/* Recent Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
          <Link to="/student/results" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((attempt) => (
                  <tr key={attempt._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.exam?.title}
                      </div>
                      <div className="text-sm text-gray-500">{attempt.exam?.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.totalMarksObtained}/{attempt.exam?.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.percentage?.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${attempt.isPassed ? 'badge-success' : 'badge-danger'}`}>
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(attempt.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaChartBar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No results available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
