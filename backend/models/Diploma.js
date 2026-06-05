import mongoose from 'mongoose';

const diplomaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du diplôme est requis'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Le code du diplôme est requis'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // in years
      min: 1,
    },
    ues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UE',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Diploma = mongoose.model('Diploma', diplomaSchema);

export default Diploma;
