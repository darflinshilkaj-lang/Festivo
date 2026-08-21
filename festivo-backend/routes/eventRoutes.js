const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  verifyTicket,
  checkInParticipant,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/my-events', authMiddleware, getMyEvents);
router.get('/:eventId', getEventById);
router.get('/:eventId/participants', authMiddleware, getEventParticipants);
router.get('/:eventId/verify-ticket/:registrationId', authMiddleware, verifyTicket);
router.post('/:eventId/check-in/:registrationId', authMiddleware, checkInParticipant);
router.post('/', authMiddleware, createEvent);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
