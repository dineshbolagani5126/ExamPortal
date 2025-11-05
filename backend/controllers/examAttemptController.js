import ExamAttempt from '../models/ExamAttempt.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Notification from '../models/Notification.js';

// @desc    Start exam attempt
// @route   POST /api/exam-attempts/start/:examId
// @access  Private (Student)
export const startExamAttempt = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId).populate('questions.question');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if exam is published
    if (!exam.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Exam is not published yet',
      });
    }

    // Check if exam has started
    const now = new Date();
    if (now < exam.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam has not started yet',
      });
    }

    // Check if exam has ended
    if (now > exam.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam has ended',
      });
    }

    // Check if student already attempted
    const existingAttempt = await ExamAttempt.findOne({
      exam: exam._id,
      student: req.user.id,
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this exam',
        attempt: existingAttempt,
      });
    }

    // Randomize questions if enabled
    let questions = exam.questions;
    if (exam.randomizeQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Create exam attempt
    const attempt = await ExamAttempt.create({
      exam: exam._id,
      student: req.user.id,
      answers: questions.map(q => ({
        question: q.question._id,
        answer: null,
        isCorrect: false,
        marksObtained: 0,
      })),
      ipAddress: req.ip,
      browserInfo: req.headers['user-agent'],
    });

    // Populate the attempt with question details (without answers)
    const populatedAttempt = await ExamAttempt.findById(attempt._id)
      .populate({
        path: 'answers.question',
        select: '-correctAnswer -options.isCorrect',
      })
      .populate('exam', 'title duration totalMarks instructions');

    res.status(201).json({
      success: true,
      message: 'Exam started successfully',
      attempt: populatedAttempt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Save answer (auto-save)
// @route   PUT /api/exam-attempts/:attemptId/answer
// @access  Private (Student)
export const saveAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    const attempt = await ExamAttempt.findById(req.params.attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found',
      });
    }

    // Check if attempt belongs to the user
    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if exam is still in progress
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Exam is not in progress',
      });
    }

    // Update answer
    const answerIndex = attempt.answers.findIndex(
      a => a.question.toString() === questionId
    );

    if (answerIndex !== -1) {
      attempt.answers[answerIndex].answer = answer;
      await attempt.save();
    }

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit exam
// @route   POST /api/exam-attempts/:attemptId/submit
// @access  Private (Student)
export const submitExam = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate('exam')
      .populate('answers.question');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found',
      });
    }

    // Check if attempt belongs to the user
    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if already submitted
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
      });
    }

    // Auto-evaluate objective questions
    let totalMarks = 0;
    for (let ans of attempt.answers) {
      const question = ans.question;

      if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && ans.answer === correctOption.text) {
          ans.isCorrect = true;
          ans.marksObtained = question.points;
          totalMarks += question.points;
        } else {
          ans.isCorrect = false;
          ans.marksObtained = 0;
          // Apply negative marking if enabled
          if (attempt.exam.negativeMarking.enabled) {
            ans.marksObtained = -attempt.exam.negativeMarking.marksPerWrong;
            totalMarks -= attempt.exam.negativeMarking.marksPerWrong;
          }
        }
      }
    }

    attempt.status = 'submitted';
    attempt.submittedAt = Date.now();
    attempt.totalMarksObtained = totalMarks;

    // Check if all questions are auto-evaluated
    const hasManualQuestions = attempt.answers.some(
      ans => ans.question.questionType === 'descriptive' || ans.question.questionType === 'coding'
    );

    if (!hasManualQuestions) {
      attempt.status = 'evaluated';
      attempt.percentage = (totalMarks / attempt.exam.totalMarks) * 100;
      attempt.isPassed = totalMarks >= attempt.exam.passingMarks;

      // Create notification for result
      await Notification.create({
        recipient: req.user.id,
        title: 'Exam Result Available',
        message: `Your result for "${attempt.exam.title}" is now available`,
        type: 'result',
        relatedExam: attempt.exam._id,
        priority: 'high',
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Exam submitted successfully',
      attempt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student's exam attempt
// @route   GET /api/exam-attempts/my/:examId
// @access  Private (Student)
export const getMyAttempt = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findOne({
      exam: req.params.examId,
      student: req.user.id,
    })
      .populate('exam')
      .populate('answers.question');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No attempt found for this exam',
      });
    }

    res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all attempts for an exam (Faculty/Admin)
// @route   GET /api/exam-attempts/exam/:examId
// @access  Private (Faculty/Admin)
export const getExamAttempts = async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ exam: req.params.examId })
      .populate('student', 'name email rollNumber')
      .populate('exam', 'title totalMarks')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Evaluate subjective answers
// @route   PUT /api/exam-attempts/:attemptId/evaluate
// @access  Private (Faculty/Admin)
export const evaluateAttempt = async (req, res) => {
  try {
    const { answers, feedback } = req.body;

    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate('exam')
      .populate('student', 'name email');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found',
      });
    }

    // Update marks for each answer
    let totalMarks = 0;
    for (let answerUpdate of answers) {
      const answerIndex = attempt.answers.findIndex(
        a => a.question.toString() === answerUpdate.questionId
      );

      if (answerIndex !== -1) {
        attempt.answers[answerIndex].marksObtained = answerUpdate.marksObtained;
        totalMarks += answerUpdate.marksObtained;
      }
    }

    attempt.totalMarksObtained = totalMarks;
    attempt.percentage = (totalMarks / attempt.exam.totalMarks) * 100;
    attempt.isPassed = totalMarks >= attempt.exam.passingMarks;
    attempt.status = 'evaluated';
    attempt.evaluatedBy = req.user.id;
    attempt.evaluatedAt = Date.now();
    attempt.feedback = feedback;

    await attempt.save();

    // Create notification for student
    await Notification.create({
      recipient: attempt.student._id,
      title: 'Exam Evaluated',
      message: `Your exam "${attempt.exam.title}" has been evaluated. Score: ${totalMarks}/${attempt.exam.totalMarks}`,
      type: 'result',
      relatedExam: attempt.exam._id,
      priority: 'high',
    });

    res.status(200).json({
      success: true,
      message: 'Exam evaluated successfully',
      attempt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student's all attempts
// @route   GET /api/exam-attempts/my-attempts
// @access  Private (Student)
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ student: req.user.id })
      .populate('exam', 'title subject totalMarks startTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
