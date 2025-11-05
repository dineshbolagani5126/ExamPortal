import User from '../models/User.js';
import ExamAttempt from '../models/ExamAttempt.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { role, department, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student performance
// @route   GET /api/users/student/:id/performance
// @access  Private
export const getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Check authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const attempts = await ExamAttempt.find({
      student: studentId,
      status: 'evaluated',
    })
      .populate('exam', 'title subject totalMarks startTime')
      .sort({ createdAt: -1 });

    const totalExams = attempts.length;
    const passedExams = attempts.filter(a => a.isPassed).length;
    const failedExams = totalExams - passedExams;

    const averagePercentage = totalExams > 0
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalExams
      : 0;

    const subjectWisePerformance = {};
    attempts.forEach(attempt => {
      const subject = attempt.exam.subject;
      if (!subjectWisePerformance[subject]) {
        subjectWisePerformance[subject] = {
          totalExams: 0,
          totalMarks: 0,
          obtainedMarks: 0,
          averagePercentage: 0,
        };
      }
      subjectWisePerformance[subject].totalExams++;
      subjectWisePerformance[subject].totalMarks += attempt.exam.totalMarks;
      subjectWisePerformance[subject].obtainedMarks += attempt.totalMarksObtained;
    });

    // Calculate average percentage for each subject
    Object.keys(subjectWisePerformance).forEach(subject => {
      const data = subjectWisePerformance[subject];
      data.averagePercentage = (data.obtainedMarks / data.totalMarks) * 100;
    });

    res.status(200).json({
      success: true,
      performance: {
        totalExams,
        passedExams,
        failedExams,
        averagePercentage: averagePercentage.toFixed(2),
        subjectWisePerformance,
        recentAttempts: attempts.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, semester } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (semester) user.semester = semester;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        semester: user.semester,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
