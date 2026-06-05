import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, "L'étudiant est requis"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'La matière est requise'],
    },
    ue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UE',
      required: [true, "L'UE est requise"],
    },
    value: {
      type: Number,
      required: [true, 'La note est requise'],
      min: [0, 'La note ne peut pas être inférieure à 0'],
      max: [20, 'La note ne peut pas dépasser 20'],
    },
    session: {
      type: String,
      enum: {
        values: ['normal', 'rattrapage'],
        message: '{VALUE} n\'est pas une session valide',
      },
      default: 'normal',
    },
    semester: {
      type: Number,
    },
    academicYear: {
      type: String, // e.g. '2024-2025'
      trim: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: {
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
gradeSchema.index(
  { student: 1, course: 1, ue: 1, session: 1, academicYear: 1 },
  { unique: true }
);
gradeSchema.index({ student: 1 });
gradeSchema.index({ course: 1 });
gradeSchema.index({ ue: 1 });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
