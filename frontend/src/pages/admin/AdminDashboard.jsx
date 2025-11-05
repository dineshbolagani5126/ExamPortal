import { useState, useEffect } from 'react';
import { FaUsers, FaClipboardList, FaQuestionCircle, FaChartBar } from 'react-icons/fa';
import StatCard from '../../components/StatCard';
import { getDashboardStats } from '../../utils/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data.stats);
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={FaUsers}
          color="primary"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents || 0}
          icon={FaUsers}
          color="success"
        />
        <StatCard
          title="Faculty"
          value={stats?.totalFaculty || 0}
          icon={FaUsers}
          color="info"
        />
        <StatCard
          title="Total Exams"
          value={stats?.totalExams || 0}
          icon={FaClipboardList}
          color="warning"
        />
        <StatCard
          title="Questions"
          value={stats?.totalQuestions || 0}
          icon={FaQuestionCircle}
          color="danger"
        />
        <StatCard
          title="Total Attempts"
          value={stats?.totalAttempts || 0}
          icon={FaChartBar}
          color="primary"
        />
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Database Status</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Server Status</span>
              <span className="badge badge-success">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">API Version</span>
              <span className="badge badge-info">v1.0.0</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/users" className="block p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Manage Users</span>
                <FaUsers className="text-primary-600" />
              </div>
            </a>
            <a href="/admin/exams" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Manage Exams</span>
                <FaClipboardList className="text-green-600" />
              </div>
            </a>
            <a href="/admin/analytics" className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">View Analytics</span>
                <FaChartBar className="text-yellow-600" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
