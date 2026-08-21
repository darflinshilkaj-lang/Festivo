const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper to format event object with both backend and frontend compatibility fields
const formatEvent = (eventDoc) => {
  const eventObj = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  const name = eventObj.eventName || eventObj.title || '';
  const college = eventObj.collegeName || eventObj.college || '';
  const date = eventObj.eventDate || eventObj.date;
  const image = eventObj.eventImage || eventObj.image || '';
  const phone = eventObj.organizerContact || eventObj.phone || '';
  const limit = eventObj.maxParticipants !== undefined ? eventObj.maxParticipants : (eventObj.registrationLimit || 100);
  const creator = eventObj.createdBy || eventObj.organizerId || null;

  return {
    id: eventObj._id.toString(),
    _id: eventObj._id.toString(),
    eventName: name,
    title: name,
    name: name,
    description: eventObj.description || '',
    collegeName: college,
    college: college,
    eventType: eventObj.eventType,
    type: eventObj.eventType,
    eventDate: date,
    date: date,
    startTime: eventObj.startTime || '09:00 AM',
    time: eventObj.startTime || '09:00 AM',
    endTime: eventObj.endTime || '05:00 PM',
    venue: eventObj.venue || 'Main Auditorium',
    location: eventObj.venue || 'Main Auditorium',
    organizer: eventObj.organizer || '',
    organizerContact: phone,
    phone: phone,
    maxParticipants: limit,
    registrationLimit: limit,
    registrationDeadline: eventObj.registrationDeadline || null,
    eventImage: image,
    image: image,
    fee: eventObj.fee || 0,
    isFree: eventObj.isFree !== undefined ? eventObj.isFree : (eventObj.fee === 0),
    registrationType: eventObj.registrationType || 'free',
    registrationFee: eventObj.registrationFee || 0,
    rules: eventObj.rules || [],
    coordinator: eventObj.coordinator || '',
    organizerId: creator ? creator.toString() : null,
    createdBy: creator ? creator.toString() : null,
    registeredParticipants: eventObj.registeredParticipants || 0,
    createdAt: eventObj.createdAt,
    updatedAt: eventObj.updatedAt
  };
};

// 1. GET ALL EVENTS
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1, date: 1 });
    const formattedEvents = events.map(formatEvent);

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving events'
    });
  }
};

// 2. GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    console.log('GET EVENT BY ID REQUESTED FOR:', eventId);

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      event: formatEvent(event)
    });
  } catch (error) {
    console.error('Error in getEventById:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving event'
    });
  }
};

// 3. GET EVENTS CREATED BY CURRENT LOGGED-IN STUDENT
const getMyEvents = async (req, res) => {
  try {
    const myEvents = await Event.find({
      $or: [
        { createdBy: req.user },
        { organizerId: req.user }
      ]
    }).sort({ createdAt: -1 });

    const formattedEvents = myEvents.map(formatEvent);

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (error) {
    console.error('Error in getMyEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your events'
    });
  }
};

// 4. CREATE EVENT
const createEvent = async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can create events.'
      });
    }

    const {
      eventName,
      collegeName,
      eventType,
      description,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      organizerContact,
      maxParticipants,
      registrationDeadline,
      eventImage,
      registrationType,
      registrationFee,
      rules,
      coordinator
    } = req.body;

    if (!eventName || !collegeName || !eventType || !description || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Event Name, College Name, Event Type, Description, and Event Date are required'
      });
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid Event Date' });
    }

    if (registrationDeadline) {
      const parsedDeadline = new Date(registrationDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid Registration Deadline' });
      }
      if (parsedDeadline > parsedEventDate) {
        return res.status(400).json({ success: false, message: 'Registration deadline cannot be after the event date' });
      }
    }

    if (maxParticipants !== undefined) {
      const parsedMax = Number(maxParticipants);
      if (isNaN(parsedMax) || parsedMax <= 0) {
        return res.status(400).json({ success: false, message: 'Maximum participants must be a valid positive number' });
      }
    }

    const parsedRegType = registrationType === "paid" ? "paid" : "free";
    const parsedRegFee = parsedRegType === "paid" ? Number(registrationFee) : 0;

    if (parsedRegType === "paid" && (isNaN(parsedRegFee) || parsedRegFee <= 0)) {
      return res.status(400).json({ success: false, message: 'Paid events require a registration fee greater than 0' });
    }

    const newEvent = new Event({
      eventName,
      title: eventName,
      collegeName,
      college: collegeName,
      eventType,
      description,
      eventDate,
      date: eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      organizerContact,
      phone: organizerContact,
      maxParticipants: maxParticipants || 100,
      registrationLimit: maxParticipants || 100,
      registrationDeadline,
      eventImage,
      image: eventImage,
      registrationType: parsedRegType,
      registrationFee: parsedRegFee,
      isFree: (parsedRegType === 'free'),
      fee: parsedRegFee,
      rules: rules || [],
      coordinator: coordinator || '',
      createdBy: req.user,
      organizerId: req.user
    });

    await newEvent.save();

    // Create notifications about the new event for everyone (fire-and-forget)
    // Note: We can notify all students of the new event as specified in user stories
    // but to avoid spam, we notify active students (e.g. limit to database users)
    // Let's create general new_event notifications for any active student
    try {
      const User = require('../models/User');
      const users = await User.find({ _id: { $ne: req.user } });
      const notifications = users.map(user => ({
        userId: user._id,
        type: 'new_event',
        title: 'New Event Added! 🚀',
        message: `"${eventName}" has been added at ${collegeName}. Check it out!`,
        eventId: newEvent._id,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch new_event notifications:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: formatEvent(newEvent)
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating event'
    });
  }
};

// 5. UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const creatorId = event.createdBy || event.organizerId;
    if (!creatorId || creatorId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own events.'
      });
    }

    const {
      eventName,
      collegeName,
      eventType,
      description,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      organizerContact,
      maxParticipants,
      registrationDeadline,
      eventImage,
      registrationType,
      registrationFee,
      rules,
      coordinator
    } = req.body;

    if (eventDate) {
      const parsedEventDate = new Date(eventDate);
      if (isNaN(parsedEventDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid Event Date' });
      }
      
      const deadlineToCheck = registrationDeadline ? new Date(registrationDeadline) : event.registrationDeadline;
      if (deadlineToCheck) {
        if (new Date(deadlineToCheck) > parsedEventDate) {
          return res.status(400).json({ success: false, message: 'Registration deadline cannot be after the event date' });
        }
      }
    }

    if (maxParticipants !== undefined) {
      const parsedMax = Number(maxParticipants);
      if (isNaN(parsedMax) || parsedMax <= 0) {
        return res.status(400).json({ success: false, message: 'Maximum participants must be a valid positive number' });
      }
    }

    const finalRegistrationType = registrationType || event.registrationType || 'free';
    let finalRegistrationFee = registrationFee !== undefined ? Number(registrationFee) : event.registrationFee;

    if (finalRegistrationType === "paid" && (isNaN(finalRegistrationFee) || finalRegistrationFee <= 0)) {
      return res.status(400).json({ success: false, message: 'Paid events require a registration fee greater than 0' });
    }

    const updateData = { ...req.body };
    if (eventName) updateData.title = eventName;
    if (collegeName) updateData.college = collegeName;
    if (eventDate) updateData.date = eventDate;
    if (organizerContact) updateData.phone = organizerContact;
    if (maxParticipants) updateData.registrationLimit = maxParticipants;
    if (eventImage) updateData.image = eventImage;

    updateData.registrationType = finalRegistrationType;
    updateData.registrationFee = finalRegistrationFee;
    updateData.isFree = (finalRegistrationType === 'free');
    updateData.fee = finalRegistrationFee;

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    // Create notifications for all registered students (fire-and-forget)
    try {
      const activeRegistrations = await Registration.find({
        eventId: id,
        registrationStatus: { $ne: 'cancelled' }
      });

      const actualEventName = eventName || event.eventName || event.title || 'Event';
      const notifications = activeRegistrations.map(reg => ({
        userId: reg.userId,
        type: 'event_updated',
        title: 'Event Details Updated 📝',
        message: `The event details for "${actualEventName}" have been updated by the organizer.`,
        eventId: id,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch event_updated notifications:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: formatEvent(updatedEvent)
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating event'
    });
  }
};

// 6. DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const creatorId = event.createdBy || event.organizerId;
    if (!creatorId || creatorId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own events.'
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
};

// 7. GET EVENT PARTICIPANTS (Organizer only)
const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify organizer authorization
    const organizerId = event.createdBy || event.organizerId;
    if (!organizerId || organizerId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view participants of your own events.'
      });
    }

    // Retrieve active registrations for this event
    const registrations = await Registration.find({
      eventId,
      registrationStatus: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    const formattedParticipants = registrations.map(reg => ({
      id: reg._id.toString(),
      _id: reg._id.toString(),
      studentName: reg.studentName,
      studentDepartment: reg.studentDepartment,
      studentYear: reg.studentYear,
      studentEmail: reg.studentEmail,
      registrationId: reg.registrationId,
      registrationStatus: reg.registrationStatus,
      registrationType: reg.registrationType,
      paymentStatus: reg.paymentStatus,
      registeredAt: reg.registeredAt,
      checkedIn: reg.checkedIn || false,
      checkedInAt: reg.checkedInAt || null,
    }));

    const checkedInCount = formattedParticipants.filter(p => p.checkedIn).length;

    return res.status(200).json({
      success: true,
      count: formattedParticipants.length,
      checkedInCount,
      maxParticipants: event.maxParticipants || event.registrationLimit || 100,
      participants: formattedParticipants
    });
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving event participants'
    });
  }
};

// 8. VERIFY TICKET (for organizer QR scanning)
const verifyTicket = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Fetch event and verify organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const organizerId = event.createdBy || event.organizerId;
    if (!organizerId || organizerId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only verify tickets for your own events.'
      });
    }

    // Find registration by registrationId string field
    const registration = await Registration.findOne({ registrationId: registrationId });

    if (!registration) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Registration not found.'
      });
    }

    // Verify the registration belongs to this event
    if (registration.eventId.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        code: 'WRONG_EVENT',
        message: 'This registration is not for this event.'
      });
    }

    // Verify registration is active
    if (registration.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        code: 'CANCELLED',
        message: 'This registration has been cancelled.'
      });
    }

    return res.status(200).json({
      success: true,
      registration: {
        id: registration._id.toString(),
        registrationId: registration.registrationId,
        studentName: registration.studentName,
        studentEmail: registration.studentEmail,
        studentDepartment: registration.studentDepartment,
        studentYear: registration.studentYear,
        eventName: registration.eventName,
        registrationStatus: registration.registrationStatus,
        registrationType: registration.registrationType,
        paymentStatus: registration.paymentStatus,
        checkedIn: registration.checkedIn || false,
        checkedInAt: registration.checkedInAt || null,
      }
    });
  } catch (error) {
    console.error('Error in verifyTicket:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying ticket'
    });
  }
};

// 9. CHECK IN PARTICIPANT
const checkInParticipant = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Fetch event and verify organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const organizerId = event.createdBy || event.organizerId;
    if (!organizerId || organizerId.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only check in participants for your own events.'
      });
    }

    // Find registration
    const registration = await Registration.findOne({ registrationId: registrationId });

    if (!registration) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Registration not found.'
      });
    }

    // Verify belongs to this event
    if (registration.eventId.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        code: 'WRONG_EVENT',
        message: 'This registration is not for this event.'
      });
    }

    // Check if cancelled
    if (registration.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        code: 'CANCELLED',
        message: 'This registration has been cancelled.'
      });
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return res.status(400).json({
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: 'Participant has already been checked in.',
        checkedInAt: registration.checkedInAt,
      });
    }

    // Validate payment for paid events
    if (registration.registrationType === 'paid' && registration.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        code: 'PAYMENT_PENDING',
        message: 'Payment has not been completed. Cannot check in participant.'
      });
    }

    // Perform check-in
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    return res.status(200).json({
      success: true,
      message: 'Participant checked in successfully.',
      checkedInAt: registration.checkedInAt,
      registration: {
        id: registration._id.toString(),
        registrationId: registration.registrationId,
        studentName: registration.studentName,
        checkedIn: registration.checkedIn,
        checkedInAt: registration.checkedInAt,
      }
    });
  } catch (error) {
    console.error('Error in checkInParticipant:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking in participant'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  verifyTicket,
  checkInParticipant,
};

