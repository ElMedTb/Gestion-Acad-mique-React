import mongoose from 'mongoose';

const ueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'UE est requis"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Le code de l'UE est requis"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    referentTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    diploma: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diploma',
    },
    eliminatoryThreshold: {
      type: Number,
      default: 6,
      min: 0,
      max: 20,
    },
    semester: {
      type: Number,
      enum: {
        values: [1, 2],
        message: 'Le semestre doit être 1 ou 2',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
ueSchema.index({ diploma: 1 });
ueSchema.index({ semester: 1 });

const UE = mongoose.model('UE', ueSchema);

export default UE;
