import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getExams, deleteExam, togglePublishExam } from '../../utils/api';
import { formatDateTime, getExamStatus, getStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, examId: null });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await getExams();
      setExams(data.exams);
    } catch (error) {
      toast.error('Failed to load exams');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExam(deleteModal.examId);
      toast.success('Exam deleted successfully');
      setExams(exams.filter(e => e._id !== deleteModal.examId));
      setDeleteModal({ isOpen: false, examId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleTogglePublish = async (examId) => {
    try {
      const { data } = await togglePublishExam(examId);
      toast.success(data.message);
      setExams(exams.map(e => e._id === examId ? data.exam : e));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update exam');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Exams</h1>
          <p className="text-gray-600 mt-2">Create and manage your examinations</p>
        </div>
        <Link to="/faculty/exams/create" className="btn btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Create Exam</span>
        </Link>
      </div>

      <div className="card">
        {exams.length > 0 ? (
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
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      <div className="text-sm text-gray-500">{exam.questions?.length || 0} questions</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(exam.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(getExamStatus(exam.startTime, exam.endTime))}`}>
                        {getExamStatus(exam.startTime, exam.endTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(exam._id)}
                        className={`flex items-center space-x-1 ${
                          exam.isPublished ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {exam.isPublished ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <Link
                        to={`/faculty/exams/edit/${exam._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaEdit className="inline" /> Edit
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, examId: exam._id })}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaClipboardList size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">No exams created yet</p>
            <Link to="/faculty/exams/create" className="btn btn-primary">
              Create Your First Exam
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, examId: null })}
        title="Delete Exam"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this exam? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, examId: null })}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageExams;
