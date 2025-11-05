import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
  },
  description: {
    type: String,
  },
  subject: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  instructions: {
    type: String,
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    order: Number,
  }],
  randomizeQuestions: {
    type: Boolean,
    default: true,
  },
  allowedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  department: {
    type: String,
  },
  semester: {
    type: Number,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  negativeMarking: {
    enabled: {
      type: Boolean,
      default: false,
    },
    marksPerWrong: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index for efficient querying
examSchema.index({ startTime: 1, endTime: 1, isPublished: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
