import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaCircle } from 'react-icons/fa';
import Timer from '../../components/Timer';
import { getExam, startExamAttempt, saveAnswer, submitExam, getMyAttempt } from '../../utils/api';
import { debounce } from '../../utils/helpers';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initializeExam();
  }, [examId]);

  const initializeExam = async () => {
    try {
      // Check if already attempted
      try {
        const attemptRes = await getMyAttempt(examId);
        if (attemptRes.data.attempt.status !== 'in-progress') {
          toast.info('You have already completed this exam');
          navigate('/student/results');
          return;
        }
        setAttempt(attemptRes.data.attempt);
        
        // Load saved answers
        const savedAnswers = {};
        attemptRes.data.attempt.answers.forEach(ans => {
          if (ans.answer) {
            savedAnswers[ans.question._id] = ans.answer;
          }
        });
        setAnswers(savedAnswers);
      } catch (error) {
        // No attempt found, start new one
        const examRes = await getExam(examId);
        setExam(examRes.data.exam);
        
        const attemptRes = await startExamAttempt(examId);
        setAttempt(attemptRes.data.attempt);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load exam');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save answer with debounce
  const autoSaveAnswer = useCallback(
    debounce(async (questionId, answer) => {
      try {
        await saveAnswer(attempt._id, { questionId, answer });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [attempt]
  );

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    autoSaveAnswer(questionId, answer);
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the exam? You cannot change answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      await submitExam(attempt._id);
      toast.success('Exam submitted successfully!');
      navigate('/student/results');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.warning('Time is up! Submitting exam...');
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const questions = attempt.answers.map(a => a.question);
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{attempt.exam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <Timer duration={attempt.exam.duration} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <span className="badge badge-info">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <p className="text-gray-800 text-lg">{currentQuestion.questionText}</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.questionType === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion._id] === option.text
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion._id}
                          value={option.text}
                          checked={answers[currentQuestion._id] === option.text}
                          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.questionType === 'true-false' && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion._id] === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion._id}
                          value={option}
                          checked={answers[currentQuestion._id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.questionType === 'descriptive' && (
                  <textarea
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="input min-h-[200px]"
                    placeholder="Type your answer here..."
                  />
                )}

                {currentQuestion.questionType === 'coding' && (
                  <div>
                    <textarea
                      value={answers[currentQuestion._id] || currentQuestion.codeTemplate || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="input min-h-[300px] font-mono text-sm"
                      placeholder="Write your code here..."
                    />
                    {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Test Cases:</h4>
                        {currentQuestion.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                          <div key={idx} className="text-sm mb-2">
                            <span className="font-medium">Input:</span> {tc.input} →{' '}
                            <span className="font-medium">Expected:</span> {tc.expectedOutput}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`aspect-square flex items-center justify-center rounded-lg font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-primary-600 text-white'
                        : answers[q._id]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-600 rounded"></div>
                  <span>Current</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary w-full mt-6"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
