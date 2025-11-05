import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'descriptive', 'coding', 'true-false'],
    required: true,
  },
  options: [{
    text: String,
    isCorrect: Boolean,
  }],
  correctAnswer: {
    type: String, // For descriptive or coding questions
  },
  points: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  topic: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  tags: [String],
  explanation: {
    type: String,
  },
  codeTemplate: {
    type: String, // For coding questions
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient searching
questionSchema.index({ topic: 1, difficulty: 1, subject: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
