import { useState, useEffect } from 'react';
import { FaTrophy, FaChartLine, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getMyAttempts, getStudentPerformance } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getGrade } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Results = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attemptsRes, performanceRes] = await Promise.all([
        getMyAttempts(),
        getStudentPerformance(user.id),
      ]);

      setAttempts(attemptsRes.data.attempts.filter(a => a.status === 'evaluated'));
      setPerformance(performanceRes.data.performance);
    } catch (error) {
      toast.error('Failed to load results');
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

  // Prepare chart data
  const chartData = attempts.slice(0, 10).reverse().map(attempt => ({
    name: attempt.exam?.title?.substring(0, 15) + '...',
    percentage: attempt.percentage,
    marks: attempt.totalMarksObtained,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-600 mt-2">View your exam performance and analytics</p>
      </div>

      {/* Performance Summary */}
      {performance && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Exams</p>
                  <p className="text-3xl font-bold mt-2">{performance.totalExams}</p>
                </div>
                <FaTrophy size={32} className="text-primary-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Passed</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{performance.passedExams}</p>
                </div>
                <FaCheckCircle size={32} className="text-green-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Failed</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">{performance.failedExams}</p>
                </div>
                <FaTimesCircle size={32} className="text-red-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold mt-2">{performance.averagePercentage}%</p>
                </div>
                <FaChartLine size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Percentage %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Subject-wise Performance */}
          {Object.keys(performance.subjectWisePerformance).length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subject-wise Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exams Taken
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obtained Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(performance.subjectWisePerformance).map(([subject, data]) => (
                      <tr key={subject}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {data.totalExams}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {data.totalMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {data.obtainedMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            data.averagePercentage >= 60 ? 'badge-success' : 
                            data.averagePercentage >= 40 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {data.averagePercentage.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detailed Results */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Results</h2>
        {attempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
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
                {attempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.exam?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.exam?.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.totalMarksObtained}/{attempt.exam?.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attempt.percentage?.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-info">
                        {getGrade(attempt.percentage)}
                      </span>
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
            <p>No results available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
