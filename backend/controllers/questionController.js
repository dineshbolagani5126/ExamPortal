import Question from '../models/Question.js';

// @desc    Create question
// @route   POST /api/questions
// @access  Private (Faculty/Admin)
export const createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private (Faculty/Admin)
export const getQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, questionType, page = 1, limit = 20 } = req.query;

    let query = {};

    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (questionType) query.questionType = questionType;

    const questions = await Question.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private (Faculty/Admin)
export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Faculty/Admin)
export const updateQuestion = async (req, res) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Faculty/Admin)
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk create questions
// @route   POST /api/questions/bulk
// @access  Private (Faculty/Admin)
export const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions',
      });
    }

    const questionsWithCreator = questions.map(q => ({
      ...q,
      createdBy: req.user.id,
    }));

    const createdQuestions = await Question.insertMany(questionsWithCreator);

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      count: createdQuestions.length,
      questions: createdQuestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unique subjects
// @route   GET /api/questions/subjects
// @access  Private (Faculty/Admin)
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');

    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get topics by subject
// @route   GET /api/questions/topics/:subject
// @access  Private (Faculty/Admin)
export const getTopicsBySubject = async (req, res) => {
  try {
    const topics = await Question.distinct('topic', { subject: req.params.subject });

    res.status(200).json({
      success: true,
      topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
