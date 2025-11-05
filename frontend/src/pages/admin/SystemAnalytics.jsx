import { useState, useEffect } from 'react';
import { getClassAnalytics } from '../../utils/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await getClassAnalytics(filters);
      setAnalytics(data.analytics);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const subjectData = analytics?.subjectWisePerformance
    ? Object.entries(analytics.subjectWisePerformance).map(([subject, data]) => ({
        subject,
        averagePercentage: parseFloat(data.averagePercentage),
        passRate: parseFloat(data.passRate),
        attempts: data.totalAttempts,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive performance analytics</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            placeholder="Filter by department"
            className="input"
          />
          <input
            type="number"
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            placeholder="Filter by semester"
            min="1"
            max="8"
            className="input"
          />
          <button
            onClick={() => setFilters({ department: '', semester: '' })}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
              <p className="text-4xl font-bold text-primary-600">{analytics.totalStudents}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Students</h3>
              <p className="text-4xl font-bold text-green-600">{analytics.activeStudents}</p>
            </div>
          </div>

          {/* Subject-wise Performance Chart */}
          {subjectData.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subject-wise Performance</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averagePercentage" fill="#3b82f6" name="Average %" />
                  <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Table */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Subject Analysis</h2>
            {subjectData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pass Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjectData.map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {data.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {data.attempts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            data.averagePercentage >= 60 ? 'badge-success' :
                            data.averagePercentage >= 40 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {data.averagePercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            data.passRate >= 60 ? 'badge-success' :
                            data.passRate >= 40 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {data.passRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No data available for the selected filters</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SystemAnalytics;
