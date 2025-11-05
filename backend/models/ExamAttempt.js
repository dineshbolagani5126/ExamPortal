import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    isCorrect: Boolean,
    marksObtained: Number,
    timeTaken: Number, // in seconds
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'evaluated', 'abandoned'],
    default: 'in-progress',
  },
  totalMarksObtained: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
  },
  isPassed: {
    type: Boolean,
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  evaluatedAt: {
    type: Date,
  },
  feedback: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  browserInfo: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one attempt per student per exam
examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);

export default ExamAttempt;
