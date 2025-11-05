import ExamAttempt from '../models/ExamAttempt.js';
import Exam from '../models/Exam.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'student') {
      // Student dashboard stats
      const totalExams = await ExamAttempt.countDocuments({ student: req.user.id });
      const completedExams = await ExamAttempt.countDocuments({
        student: req.user.id,
        status: 'evaluated',
      });
      const upcomingExams = await Exam.countDocuments({
        $or: [
          { allowedStudents: req.user.id },
          { department: req.user.department, semester: req.user.semester },
        ],
        isPublished: true,
        startTime: { $gt: new Date() },
      });

      const attempts = await ExamAttempt.find({
        student: req.user.id,
        status: 'evaluated',
      });

      const averageScore = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        : 0;

      stats = {
        totalExams,
        completedExams,
        upcomingExams,
        averageScore: averageScore.toFixed(2),
      };
    } else if (req.user.role === 'faculty') {
      // Faculty dashboard stats
      const totalExams = await Exam.countDocuments({ createdBy: req.user.id });
      const publishedExams = await Exam.countDocuments({
        createdBy: req.user.id,
        isPublished: true,
      });
      const totalQuestions = await Question.countDocuments({ createdBy: req.user.id });

      const exams = await Exam.find({ createdBy: req.user.id });
      const examIds = exams.map(e => e._id);

      const totalAttempts = await ExamAttempt.countDocuments({
        exam: { $in: examIds },
      });

      const pendingEvaluations = await ExamAttempt.countDocuments({
        exam: { $in: examIds },
        status: 'submitted',
      });

      stats = {
        totalExams,
        publishedExams,
        totalQuestions,
        totalAttempts,
        pendingEvaluations,
      };
    } else if (req.user.role === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalFaculty = await User.countDocuments({ role: 'faculty' });
      const totalExams = await Exam.countDocuments();
      const totalQuestions = await Question.countDocuments();
      const totalAttempts = await ExamAttempt.countDocuments();

      stats = {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalExams,
        totalQuestions,
        totalAttempts,
      };
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exam analytics
// @route   GET /api/analytics/exam/:examId
// @access  Private (Faculty/Admin)
export const getExamAnalytics = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const attempts = await ExamAttempt.find({
      exam: exam._id,
      status: 'evaluated',
    }).populate('student', 'name rollNumber');

    const totalAttempts = attempts.length;
    const passedStudents = attempts.filter(a => a.isPassed).length;
    const failedStudents = totalAttempts - passedStudents;

    const averageScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.totalMarksObtained, 0) / totalAttempts
      : 0;

    const averagePercentage = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
      : 0;

    const highestScore = totalAttempts > 0
      ? Math.max(...attempts.map(a => a.totalMarksObtained))
      : 0;

    const lowestScore = totalAttempts > 0
      ? Math.min(...attempts.map(a => a.totalMarksObtained))
      : 0;

    // Score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    attempts.forEach(attempt => {
      const percentage = attempt.percentage;
      if (percentage <= 20) scoreRanges['0-20']++;
      else if (percentage <= 40) scoreRanges['21-40']++;
      else if (percentage <= 60) scoreRanges['41-60']++;
      else if (percentage <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.status(200).json({
      success: true,
      analytics: {
        examTitle: exam.title,
        totalMarks: exam.totalMarks,
        totalAttempts,
        passedStudents,
        failedStudents,
        passPercentage: totalAttempts > 0 ? ((passedStudents / totalAttempts) * 100).toFixed(2) : 0,
        averageScore: averageScore.toFixed(2),
        averagePercentage: averagePercentage.toFixed(2),
        highestScore,
        lowestScore,
        scoreDistribution: scoreRanges,
        topPerformers: attempts
          .sort((a, b) => b.totalMarksObtained - a.totalMarksObtained)
          .slice(0, 5)
          .map(a => ({
            student: a.student,
            score: a.totalMarksObtained,
            percentage: a.percentage,
          })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get class analytics
// @route   GET /api/analytics/class
// @access  Private (Faculty/Admin)
export const getClassAnalytics = async (req, res) => {
  try {
    const { department, semester } = req.query;

    let studentQuery = {};
    if (department) studentQuery.department = department;
    if (semester) studentQuery.semester = parseInt(semester);

    const students = await User.find({ ...studentQuery, role: 'student' });
    const studentIds = students.map(s => s._id);

    const attempts = await ExamAttempt.find({
      student: { $in: studentIds },
      status: 'evaluated',
    }).populate('exam', 'subject');

    const totalStudents = students.length;
    const activeStudents = new Set(attempts.map(a => a.student.toString())).size;

    const subjectWisePerformance = {};
    attempts.forEach(attempt => {
      const subject = attempt.exam.subject;
      if (!subjectWisePerformance[subject]) {
        subjectWisePerformance[subject] = {
          totalAttempts: 0,
          averagePercentage: 0,
          passRate: 0,
          passed: 0,
        };
      }
      subjectWisePerformance[subject].totalAttempts++;
      subjectWisePerformance[subject].averagePercentage += attempt.percentage;
      if (attempt.isPassed) subjectWisePerformance[subject].passed++;
    });

    // Calculate averages
    Object.keys(subjectWisePerformance).forEach(subject => {
      const data = subjectWisePerformance[subject];
      data.averagePercentage = (data.averagePercentage / data.totalAttempts).toFixed(2);
      data.passRate = ((data.passed / data.totalAttempts) * 100).toFixed(2);
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalStudents,
        activeStudents,
        subjectWisePerformance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
