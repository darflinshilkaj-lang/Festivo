const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
    },
    studentDepartment: {
      type: String,
      required: true,
      trim: true,
    },
    studentYear: {
      type: String,
      required: true,
    },
    studentCollege: {
      type: String,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventCollege: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    registrationType: {
      type: String,
      enum: ['free', 'paid'],
      required: true,
      default: 'free',
    },
    registrationFee: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index to prevent duplicate registrations
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
