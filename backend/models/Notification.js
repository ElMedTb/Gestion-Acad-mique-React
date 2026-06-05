import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ['email', 'sms'],
      required: [true, 'Le canal est requis'],
    },
    recipient: {
      type: String,
      required: [true, 'Le destinataire est requis'],
      trim: true,
    },
    recipientRole: {
      type: String,
      enum: ['student', 'teacher', 'all'],
      required: [true, 'Le role destinataire est requis'],
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Le message est requis'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['dev', 'queued', 'sent', 'delivered', 'undelivered', 'failed'],
      default: 'dev',
    },
    deliveryDetail: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
