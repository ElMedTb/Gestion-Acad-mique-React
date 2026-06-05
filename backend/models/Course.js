import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la matière est requis'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Le code de la matière est requis'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    syllabus: {
      type: String, // Long text or external URL
      default: '',
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    coefficient: {
      type: Number,
      default: 1,
      min: [0.5, 'Le coefficient minimum est 0.5'],
    },
    credits: {
      type: Number,
      default: 3,
      min: [1, 'Le nombre de crédits minimum est 1'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
courseSchema.index({ teacher: 1 });
courseSchema.index({ name: 'text', code: 'text' });

const Course = mongoose.model('Course', courseSchema);

export default Course;
