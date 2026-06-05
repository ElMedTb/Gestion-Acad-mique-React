import mongoose from 'mongoose';
import { generateTeacherId } from '../utils/generateId.js';

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "La référence utilisateur est requise"],
      unique: true,
    },
    teacherId: {
      type: String,
      unique: true,
    },
    photo: {
      type: String,
    },
    speciality: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    office: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
teacherSchema.pre('save', async function (next) {
  if (!this.teacherId) {
    try {
      this.teacherId = await generateTeacherId();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
