import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createExam, updateExam, getExam, getQuestions } from '../../utils/api';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '../../components/Modal';

const CreateExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(examId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    startTime: '',
    endTime: '',
    instructions: '',
    department: '',
    semester: '',
    randomizeQuestions: true,
    negativeMarking: {
      enabled: false,
      marksPerWrong: 0,
    },
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchExam();
    }
    fetchQuestions();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const { data } = await getExam(examId);
      const exam = data.exam;
      
      setFormData({
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startTime: new Date(exam.startTime).toISOString().slice(0, 16),
        endTime: new Date(exam.endTime).toISOString().slice(0, 16),
        instructions: exam.instructions,
        department: exam.department || '',
        semester: exam.semester || '',
        randomizeQuestions: exam.randomizeQuestions,
        negativeMarking: exam.negativeMarking,
      });

      setSelectedQuestions(exam.questions.map(q => q.question));
    } catch (error) {
      toast.error('Failed to load exam');
      navigate('/faculty/exams');
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await getQuestions({ limit: 100 });
      setAvailableQuestions(data.questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAddQuestion = (question) => {
    if (!selectedQuestions.find(q => q._id === question._id)) {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q._id !== questionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setLoading(true);

    try {
      const examData = {
        ...formData,
        questions: selectedQuestions.map((q, index) => ({
          question: q._id,
          order: index + 1,
        })),
      };

      if (isEdit) {
        await updateExam(examId, examData);
        toast.success('Exam updated successfully');
      } else {
        await createExam(examData);
        toast.success('Exam created successfully');
      }

      navigate('/faculty/exams');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Exam' : 'Create New Exam'}
        </h1>
        <p className="text-gray-600 mt-2">Fill in the exam details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Mid-Term Examination"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Brief description of the exam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                required
                min="1"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Marks *
              </label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                required
                min="1"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="8"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="Enter exam instructions for students..."
          />
        </div>

        {/* Settings */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="randomizeQuestions"
                checked={formData.randomizeQuestions}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-gray-700">Randomize question order for each student</span>
            </label>

            <div className="border-t pt-4">
              <label className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  name="negativeMarking.enabled"
                  checked={formData.negativeMarking.enabled}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-gray-700">Enable negative marking</span>
              </label>

              {formData.negativeMarking.enabled && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks deducted per wrong answer
                  </label>
                  <input
                    type="number"
                    name="negativeMarking.marksPerWrong"
                    value={formData.negativeMarking.marksPerWrong}
                    onChange={handleChange}
                    min="0"
                    step="0.25"
                    className="input max-w-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Questions ({selectedQuestions.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowQuestionModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Questions</span>
            </button>
          </div>

          {selectedQuestions.length > 0 ? (
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div key={question._id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">Q{index + 1}.</span>
                      <span className="badge badge-info">{question.questionType}</span>
                      <span className="badge badge-success">{question.points} marks</span>
                    </div>
                    <p className="text-gray-700">{question.questionText}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Topic: {question.topic} | Difficulty: {question.difficulty}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(question._id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No questions added yet. Click "Add Questions" to get started.</p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/faculty/exams')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : isEdit ? 'Update Exam' : 'Create Exam'}
          </button>
        </div>
      </form>

      {/* Question Selection Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="Select Questions"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableQuestions.map((question) => {
            const isSelected = selectedQuestions.find(q => q._id === question._id);
            return (
              <div
                key={question._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAddQuestion(question)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-info">{question.questionType}</span>
                    <span className="badge badge-success">{question.points} marks</span>
                    <span className="badge badge-warning">{question.difficulty}</span>
                  </div>
                  {isSelected && (
                    <span className="text-primary-600 font-medium">✓ Selected</span>
                  )}
                </div>
                <p className="text-gray-700 mb-1">{question.questionText}</p>
                <p className="text-sm text-gray-500">
                  Subject: {question.subject} | Topic: {question.topic}
                </p>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default CreateExam;
