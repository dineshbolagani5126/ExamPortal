import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import ExamAttempt from '../models/ExamAttempt.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Create exam
// @route   POST /api/exams
// @access  Private (Faculty/Admin)
export const createExam = async (req, res) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const exam = await Exam.create(examData);

    // Create notifications for allowed students
    if (exam.allowedStudents && exam.allowedStudents.length > 0) {
      const notifications = exam.allowedStudents.map(studentId => ({
        recipient: studentId,
        title: 'New Exam Scheduled',
        message: `A new exam "${exam.title}" has been scheduled for ${new Date(exam.startTime).toLocaleString()}`,
        type: 'exam',
        relatedExam: exam._id,
        priority: 'high',
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
  try {
    let query = {};

    // Filter based on role
    if (req.user.role === 'student') {
      query = {
        $or: [
          { allowedStudents: req.user.id },
          { department: req.user.department, semester: req.user.semester },
        ],
        isPublished: true,
      };
    } else if (req.user.role === 'faculty') {
      query = { createdBy: req.user.id };
    }
    // Admin can see all exams

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .populate('questions.question')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions.question');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if student is allowed to view this exam
    if (req.user.role === 'student') {
      const isAllowed = exam.allowedStudents.some(
        studentId => studentId.toString() === req.user.id.toString()
      ) || (exam.department === req.user.department && exam.semester === req.user.semester);

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to access this exam',
        });
      }
    }

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Faculty/Admin)
export const updateExam = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if user is authorized to update
    if (req.user.role === 'faculty' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this exam',
      });
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Faculty/Admin)
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if user is authorized to delete
    if (req.user.role === 'faculty' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this exam',
      });
    }

    await exam.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get upcoming exams for student
// @route   GET /api/exams/upcoming
// @access  Private (Student)
export const getUpcomingExams = async (req, res) => {
  try {
    const now = new Date();

    const exams = await Exam.find({
      $or: [
        { allowedStudents: req.user.id },
        { department: req.user.department, semester: req.user.semester },
      ],
      isPublished: true,
      startTime: { $gt: now },
    })
      .populate('createdBy', 'name')
      .sort({ startTime: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Publish/Unpublish exam
// @route   PATCH /api/exams/:id/publish
// @access  Private (Faculty/Admin)
export const togglePublishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.status(200).json({
      success: true,
      message: `Exam ${exam.isPublished ? 'published' : 'unpublished'} successfully`,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
