import mongoose from 'mongoose';
import { generateStudentId } from '../utils/generateId.js';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "La référence utilisateur est requise"],
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
    },
    photo: {
      type: String, // URL or file path
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'Maroc' },
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
      default: '',
    },
    className: {
      type: String,
      trim: true,
      default: '',
    },
    filiere: {
      type: String,
      trim: true,
      default: '',
    },
    group: {
      type: String,
      trim: true,
      default: '',
    },
    diploma: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diploma',
    },
    doubleDiplomation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diploma',
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    try {
      this.studentId = await generateStudentId();
    } catch (err) {
      return next(err);
    }
  }
  next();
});
studentSchema.index({ diploma: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
