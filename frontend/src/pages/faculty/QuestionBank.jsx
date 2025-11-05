import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../utils/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    questionType: '',
  });

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'multiple-choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: '',
    points: 1,
    difficulty: 'medium',
    topic: '',
    subject: '',
    tags: '',
    explanation: '',
    codeTemplate: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      const { data } = await getQuestions(filters);
      setQuestions(data.questions);
    } catch (error) {
      toast.error('Failed to load questions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'multiple-choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: '',
      points: 1,
      difficulty: 'medium',
      topic: '',
      subject: '',
      tags: '',
      explanation: '',
      codeTemplate: '',
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: question.correctAnswer || '',
      points: question.points,
      difficulty: question.difficulty,
      topic: question.topic,
      subject: question.subject,
      tags: question.tags?.join(', ') || '',
      explanation: question.explanation || '',
      codeTemplate: question.codeTemplate || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteQuestion(id);
      toast.success('Question deleted successfully');
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    };

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, questionData);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(questionData);
        toast.success('Question created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'isCorrect') {
      // Only one option can be correct
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
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
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-2">Manage your question repository</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            placeholder="Subject"
            className="input"
          />
          <input
            type="text"
            name="topic"
            value={filters.topic}
            onChange={handleFilterChange}
            placeholder="Topic"
            className="input"
          />
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="input"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            name="questionType"
            value={filters.questionType}
            onChange={handleFilterChange}
            className="input"
          >
            <option value="">All Types</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="descriptive">Descriptive</option>
            <option value="coding">Coding</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">
          Questions ({questions.length})
        </h3>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question._id} className="border rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">Q{index + 1}.</span>
                      <span className="badge badge-info">{question.questionType}</span>
                      <span className={`badge ${
                        question.difficulty === 'easy' ? 'badge-success' :
                        question.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="badge badge-info">{question.points} marks</span>
                    </div>
                    <p className="text-gray-800 mb-2">{question.questionText}</p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Subject:</span> {question.subject} |{' '}
                      <span className="font-medium">Topic:</span> {question.topic}
                    </div>
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {question.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No questions found. Add your first question to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                className="input"
                required
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="descriptive">Descriptive</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="input"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                className="input"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input"
                placeholder="algebra, equations"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="input"
              rows="3"
              required
            />
          </div>

          {/* Options for Multiple Choice */}
          {formData.questionType === 'multiple-choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      className="input flex-1"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select the correct answer</p>
            </div>
          )}

          {/* Correct Answer for Descriptive */}
          {formData.questionType === 'descriptive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Answer
              </label>
              <textarea
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="input"
                rows="3"
              />
            </div>
          )}

          {/* Code Template for Coding Questions */}
          {formData.questionType === 'coding' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Template
              </label>
              <textarea
                value={formData.codeTemplate}
                onChange={(e) => setFormData({ ...formData, codeTemplate: e.target.value })}
                className="input font-mono text-sm"
                rows="5"
                placeholder="// Write your code template here"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="input"
              rows="2"
              placeholder="Optional explanation for the answer"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingQuestion ? 'Update' : 'Create'} Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
