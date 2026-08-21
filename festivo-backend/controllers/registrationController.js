const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper to generate human-readable registrationId
const generateRegistrationId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let randLetters = '';
  let randDigits = '';
  for (let i = 0; i < 2; i++) {
    randLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    randDigits += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return `FST-2026-${randLetters}${randDigits}`;
};

// Helper to format registration object safely
// Also lazily generates & persists a registrationId if missing (for old registrations)
const formatRegistration = async (regDoc) => {
  const regObj = regDoc.toObject ? regDoc.toObject() : regDoc;
  const isEventPopulated = regObj.eventId && typeof regObj.eventId === 'object' && regObj.eventId._id;
  const eventIdStr = isEventPopulated ? regObj.eventId._id.toString() : (regObj.eventId ? regObj.eventId.toString() : null);
  const event = isEventPopulated ? regObj.eventId : null;

  // Lazily backfill missing registrationId for older registrations
  let regId = regObj.registrationId;
  if (!regId) {
    regId = generateRegistrationId();
    // Make sure it's unique before saving
    let attempts = 0;
    while (attempts < 10) {
      const conflict = await Registration.findOne({ registrationId: regId, _id: { $ne: regObj._id } });
      if (!conflict) break;
      regId = generateRegistrationId();
      attempts++;
    }
    // Persist so subsequent fetches always return the same ID
    await Registration.findByIdAndUpdate(regObj._id, { registrationId: regId });
  }

  return {
    id: regObj._id.toString(),
    _id: regObj._id.toString(),
    registrationId: regId,
    userId: regObj.userId.toString(),
    eventId: eventIdStr,
    studentName: regObj.studentName,
    studentEmail: regObj.studentEmail,
    studentDepartment: regObj.studentDepartment,
    studentYear: regObj.studentYear,
    studentCollege: regObj.studentCollege,
    eventName: event?.eventName || event?.title || regObj.eventName,
    eventCollege: event?.collegeName || event?.college || regObj.eventCollege,
    eventType: event?.eventType || regObj.eventType,
    eventDate: event?.eventDate || event?.date || regObj.eventDate,
    eventImage: event?.image || event?.eventImage || null,
    venue: event?.venue || event?.location || null,
    startTime: event?.startTime || null,
    endTime: event?.endTime || null,
    organizer: event?.organizer || null,
    organizerContact: event?.phone || event?.organizerContact || null,
    registrationType: regObj.registrationType,
    registrationFee: regObj.registrationFee,
    paymentStatus: regObj.paymentStatus,
    registrationStatus: regObj.registrationStatus,
    registeredAt: regObj.registeredAt,
    createdAt: regObj.createdAt,
    updatedAt: regObj.updatedAt
  };
};

// 1. CREATE REGISTRATION
const createRegistration = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user;

    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid event ID is required'
      });
    }

    // Fetch the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is the event organizer (organizers shouldn't register for their own events)
    const creatorId = event.createdBy || event.organizerId;
    if (creatorId && creatorId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot register for your own event'
      });
    }

    // Check registration deadline
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({
          success: false,
          message: 'Registration deadline has passed'
        });
      }
    }

    // Check participant limit
    const currentParticipants = event.registeredParticipants || 0;
    const maxParticipants = event.maxParticipants || event.registrationLimit || 100;
    if (currentParticipants >= maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event registration is full'
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      userId: userId,
      eventId: eventId,
      registrationStatus: { $ne: 'cancelled' }
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    // Generate unique registrationId
    let registrationId;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 15) {
      registrationId = generateRegistrationId();
      const existing = await Registration.findOne({ registrationId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate a unique registration ID. Please try again.'
      });
    }

    // Determine registration type and fee from event (never trust client data)
    const registrationType = event.registrationType || 'free';
    const registrationFee = registrationType === 'paid' ? (event.registrationFee || 0) : 0;

    // Create registration
    const newRegistration = new Registration({
      registrationId: registrationId,
      userId: userId,
      eventId: eventId,
      studentName: user.name,
      studentEmail: user.email,
      studentDepartment: user.department,
      studentYear: user.year,
      studentCollege: user.college || 'College Name',
      eventName: event.eventName || event.title || 'Event',
      eventCollege: event.collegeName || event.college || 'College',
      eventType: event.eventType,
      eventDate: event.eventDate || event.date,
      registrationType: registrationType,
      registrationFee: registrationFee,
      paymentStatus: registrationType === 'paid' ? 'pending' : 'completed',
      registrationStatus: 'confirmed'
    });

    await newRegistration.save();

    // Increment event participant count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredParticipants: 1 }
    });

    // Refresh event to get updated count
    const updatedEvent = await Event.findById(eventId);
    const updatedCount = updatedEvent ? updatedEvent.registeredParticipants : currentParticipants + 1;

    // ─── Create notifications (fire-and-forget, don't block the response) ───

    // 1. Notify the registering student
    try {
      await Notification.create({
        userId: userId,
        type: 'registration_success',
        title: 'Registration Successful',
        message: `You successfully registered for ${newRegistration.eventName}.`,
        eventId: eventId,
        registrationId: newRegistration._id,
      });
    } catch (notifErr) {
      console.warn('Failed to create student registration notification:', notifErr.message);
    }

    // 2. Notify the event organizer (if organizer is a different user)
    const organizerId = event.createdBy || event.organizerId;
    if (organizerId && organizerId.toString() !== userId.toString()) {
      try {
        await Notification.create({
          userId: organizerId,
          type: 'new_registration',
          title: 'New Registration',
          message: `A student registered for your event ${newRegistration.eventName}.`,
          eventId: eventId,
          registrationId: newRegistration._id,
        });
      } catch (notifErr) {
        console.warn('Failed to create organizer new_registration notification:', notifErr.message);
      }

      // 3. If event is ≥80% full, also alert the organizer
      const capacity = updatedEvent ? (updatedEvent.maxParticipants || updatedEvent.registrationLimit || 100) : maxParticipants;
      const fullPercent = updatedCount / capacity;
      if (fullPercent >= 0.8) {
        const remaining = capacity - updatedCount;
        try {
          await Notification.create({
            userId: organizerId,
            type: 'event_almost_full',
            title: 'Event Almost Full',
            message: `Your event "${newRegistration.eventName}" is almost full — only ${remaining} spot${remaining === 1 ? '' : 's'} left!`,
            eventId: eventId,
          });
        } catch (notifErr) {
          console.warn('Failed to create organizer event_almost_full notification:', notifErr.message);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: registrationType === 'paid'
        ? 'Registration created. Please complete payment to confirm.'
        : 'Registration successful',
      registration: await formatRegistration(newRegistration)
    });
  } catch (error) {
    console.error('Error in createRegistration:', error);
    
    // Handle duplicate key error from MongoDB unique index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating registration'
    });
  }
};

// 2. GET USER'S REGISTRATIONS
const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user;

    const registrations = await Registration.find({
      userId: userId,
      registrationStatus: { $ne: 'cancelled' }
    }).populate('eventId').sort({ registeredAt: -1 });

    const formattedRegistrations = await Promise.all(registrations.map(formatRegistration));

    return res.status(200).json({
      success: true,
      count: formattedRegistrations.length,
      registrations: formattedRegistrations
    });
  } catch (error) {
    console.error('Error in getMyRegistrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving registrations'
    });
  }
};

// 3. GET REGISTRATION BY ID (or human-readable registrationId)
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    let registration;
    if (mongoose.Types.ObjectId.isValid(id)) {
      registration = await Registration.findById(id).populate('eventId');
    } else {
      registration = await Registration.findOne({ registrationId: id }).populate('eventId');
    }

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user owns this registration
    if (registration.userId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own registrations.'
      });
    }

    return res.status(200).json({
      success: true,
      registration: await formatRegistration(registration)
    });
  } catch (error) {
    console.error('Error in getRegistrationById:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving registration'
    });
  }
};

// 4. CANCEL REGISTRATION
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user owns this registration
    if (registration.userId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own registrations.'
      });
    }

    // Check if already cancelled
    if (registration.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    // Update registration status
    registration.registrationStatus = 'cancelled';
    await registration.save();

    // Decrement event participant count
    await Event.findByIdAndUpdate(registration.eventId, {
      $inc: { registeredParticipants: -1 }
    });

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      registration: await formatRegistration(registration)
    });
  } catch (error) {
    console.error('Error in cancelRegistration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error cancelling registration'
    });
  }
};

// 5. GET EVENT REGISTRATIONS (for organizers)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid event ID is required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the event organizer
    const creatorId = event.createdBy || event.organizerId;
    if (!creatorId || creatorId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event organizers can view registrations.'
      });
    }

    const registrations = await Registration.find({
      eventId: eventId,
      registrationStatus: { $ne: 'cancelled' }
    }).sort({ registeredAt: -1 });

    const formattedRegistrations = await Promise.all(registrations.map(formatRegistration));

    return res.status(200).json({
      success: true,
      count: formattedRegistrations.length,
      registrations: formattedRegistrations
    });
  } catch (error) {
    console.error('Error in getEventRegistrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving event registrations'
    });
  }
};

module.exports = {
  createRegistration,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  getEventRegistrations
};
