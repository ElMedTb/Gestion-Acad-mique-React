import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'adresse email est requise"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir une adresse email valide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Le hash ne sort pas des requetes classiques.
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'scolarite', 'student', 'teacher'],
        message: '{VALUE} n\'est pas un rôle valide',
      },
      default: 'student',
    },
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    validationToken: {
      type: String,
      select: false,
    },
    validationTokenExpires: {
      type: Date,
      select: false,
    },
    otpSecret: {
      type: String,
      select: false,
    },
    otpEnabled: {
      type: Boolean,
      default: false,
    },
    googleId: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

export default User;
