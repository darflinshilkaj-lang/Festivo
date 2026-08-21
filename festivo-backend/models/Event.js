const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    college: {
      type: String,
      required: false,
      trim: true
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: [
          'Symposium',
          'Hackathon',
          'Workshop',
          'Cultural',
          'Technical',
          'Sports',
          'College Festival',
          'Technical Symposium',
          'Cultural Event',
          'Sports Event',
          'Other'
        ],
        message: '{VALUE} is not a supported event type'
      }
    },
    date: {
      type: Date,
      required: false
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required']
    },
    startTime: {
      type: String,
      default: '09:00 AM'
    },
    endTime: {
      type: String,
      default: '05:00 PM'
    },
    venue: {
      type: String,
      default: 'Main Auditorium'
    },
    organizer: {
      type: String,
      default: 'Festivo Event Committee'
    },
    organizerContact: {
      type: String,
      default: ''
    },
    maxParticipants: {
      type: Number,
      default: 100
    },
    registrationLimit: {
      type: Number,
      default: 100
    },
    registrationDeadline: {
      type: Date,
      required: false
    },
    image: {
      type: String,
      default: ''
    },
    eventImage: {
      type: String,
      default: ''
    },
    fee: {
      type: Number,
      default: 0
    },
    isFree: {
      type: Boolean,
      default: true
    },
    registrationType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    },
    registrationFee: {
      type: Number,
      default: 0,
      min: 0
    },
    rules: {
      type: [String],
      default: []
    },
    coordinator: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    registeredParticipants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
