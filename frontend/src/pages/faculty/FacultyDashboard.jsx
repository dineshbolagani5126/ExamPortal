import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaQuestionCircle, FaUsers, FaCheckCircle } from 'react-icons/fa';
import StatCard from '../../components/StatCard';
import { getDashboardStats, getExams } from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, examsRes] = await Promise.all([
        getDashboardStats(),
        getExams(),
      ]);

      setStats(statsRes.data.stats);
      setRecentExams(examsRes.data.exams.slice(0, 5));
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
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your exams and evaluate students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Exams"
          value={stats?.totalExams || 0}
          icon={FaClipboardList}
          color="primary"
        />
        <StatCard
          title="Published"
          value={stats?.publishedExams || 0}
          icon={FaCheckCircle}
          color="success"
        />
        <StatCard
          title="Questions"
          value={stats?.totalQuestions || 0}
          icon={FaQuestionCircle}
          color="info"
        />
        <StatCard
          title="Total Attempts"
          value={stats?.totalAttempts || 0}
          icon={FaUsers}
          color="warning"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats?.pendingEvaluations || 0}
          icon={FaCheckCircle}
          color="danger"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/faculty/exams/create" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Exam</h3>
            <p className="text-gray-600 text-sm mt-2">Set up a new examination</p>
          </div>
        </Link>

        <Link to="/faculty/questions" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaQuestionCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
            <p className="text-gray-600 text-sm mt-2">Manage your questions</p>
          </div>
        </Link>

        <Link to="/faculty/evaluate" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Evaluate Exams</h3>
            <p className="text-gray-600 text-sm mt-2">Review student submissions</p>
          </div>
        </Link>
      </div>

      {/* Recent Exams */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Exams</h2>
          <Link to="/faculty/exams" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {recentExams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExams.map((exam) => (
                  <tr key={exam._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(exam.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${exam.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {exam.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/faculty/exams/edit/${exam._id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No exams created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
