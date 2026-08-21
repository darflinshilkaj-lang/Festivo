const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  getEventRegistrations
} = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createRegistration);
router.get('/my', authMiddleware, getMyRegistrations);
router.get('/:id', authMiddleware, getRegistrationById);
router.delete('/:id', authMiddleware, cancelRegistration);
router.get('/event/:eventId', authMiddleware, getEventRegistrations);

module.exports = router;
