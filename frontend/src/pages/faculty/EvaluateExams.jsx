import { useState, useEffect } from 'react';
import { getExams, getExamAttempts, evaluateAttempt } from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';

const EvaluateExams = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState('');

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

  const fetchAttempts = async (examId) => {
    try {
      const { data } = await getExamAttempts(examId);
      setAttempts(data.attempts.filter(a => a.status === 'submitted' || a.status === 'evaluated'));
      setSelectedExam(examId);
    } catch (error) {
      toast.error('Failed to load attempts');
      console.error(error);
    }
  };

  const handleEvaluate = (attempt) => {
    setSelectedAttempt(attempt);
    
    // Initialize marks with existing values
    const initialMarks = {};
    attempt.answers.forEach(ans => {
      if (ans.question.questionType === 'descriptive' || ans.question.questionType === 'coding') {
        initialMarks[ans.question._id] = ans.marksObtained || 0;
      }
    });
    setMarks(initialMarks);
    setFeedback(attempt.feedback || '');
    setEvaluationModal(true);
  };

  const handleSubmitEvaluation = async () => {
    try {
      const answers = Object.entries(marks).map(([questionId, marksObtained]) => ({
        questionId,
        marksObtained: parseFloat(marksObtained),
      }));

      await evaluateAttempt(selectedAttempt._id, { answers, feedback });
      toast.success('Evaluation submitted successfully');
      setEvaluationModal(false);
      fetchAttempts(selectedExam);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit evaluation');
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
        <h1 className="text-3xl font-bold text-gray-900">Evaluate Exams</h1>
        <p className="text-gray-600 mt-2">Review and grade student submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams List */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Exam</h2>
          <div className="space-y-2">
            {exams.map((exam) => (
              <button
                key={exam._id}
                onClick={() => fetchAttempts(exam._id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedExam === exam._id
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-gray-900">{exam.title}</div>
                <div className="text-sm text-gray-500">{exam.subject}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Attempts List */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Student Submissions {selectedExam && `(${attempts.length})`}
          </h2>

          {selectedExam ? (
            attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attempts.map((attempt) => (
                      <tr key={attempt._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {attempt.student?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attempt.student?.rollNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(attempt.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            attempt.status === 'evaluated' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attempt.status === 'evaluated'
                            ? `${attempt.totalMarksObtained}/${attempt.exam?.totalMarks}`
                            : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEvaluate(attempt)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {attempt.status === 'evaluated' ? 'Re-evaluate' : 'Evaluate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No submissions yet for this exam</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Select an exam to view submissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      <Modal
        isOpen={evaluationModal}
        onClose={() => setEvaluationModal(false)}
        title={`Evaluate - ${selectedAttempt?.student?.name}`}
        size="xl"
      >
        {selectedAttempt && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Student:</span>
                  <p className="font-medium">{selectedAttempt.student?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Roll Number:</span>
                  <p className="font-medium">{selectedAttempt.student?.rollNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <p className="font-medium">{formatDateTime(selectedAttempt.submittedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Auto-graded Score:</span>
                  <p className="font-medium">{selectedAttempt.totalMarksObtained}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedAttempt.answers
                .filter(ans => ans.question.questionType === 'descriptive' || ans.question.questionType === 'coding')
                .map((ans, index) => (
                  <div key={ans.question._id} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                        <span className="badge badge-info">{ans.question.points} marks</span>
                      </div>
                      <p className="text-gray-700">{ans.question.questionText}</p>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student's Answer:
                      </label>
                      <div className="bg-gray-50 p-3 rounded border">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                          {ans.answer || 'No answer provided'}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marks Obtained (out of {ans.question.points}):
                      </label>
                      <input
                        type="number"
                        value={marks[ans.question._id] || 0}
                        onChange={(e) => setMarks({
                          ...marks,
                          [ans.question._id]: Math.min(parseFloat(e.target.value) || 0, ans.question.points)
                        })}
                        min="0"
                        max={ans.question.points}
                        step="0.5"
                        className="input max-w-xs"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="input"
                rows="3"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEvaluationModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEvaluation}
                className="btn btn-primary"
              >
                Submit Evaluation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EvaluateExams;
