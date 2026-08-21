const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id, isOrganizer = false) => {
  return jwt.sign({ id, role: 'student', isOrganizer }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper for email validation format
const validateEmailFormat = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

// 1. REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, department, year, college } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    if (!validateEmailFormat(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user (isOrganizer defaults to false)
    const user = new User({
      name,
      email: emailLower,
      password,
      department,
      year,
      college,
      role: 'student',
      isOrganizer: false
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.isOrganizer);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        college: user.college,
        role: user.role || 'student',
        isOrganizer: user.isOrganizer || false
      }
    });

  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// 2. LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token with isOrganizer payload
    const token = generateToken(user._id, user.isOrganizer || false);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        college: user.college,
        role: user.role || 'student',
        isOrganizer: user.isOrganizer || false
      }
    });

  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// 3. GET PROFILE
const getProfile = async (req, res) => {
  try {
    // req.user contains the user ID from authMiddleware
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        college: user.college,
        role: user.role || 'student',
        isOrganizer: user.isOrganizer || false,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// 4. UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, department, year, college } = req.body;

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only allowed fields
    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (college !== undefined) user.college = college;

    // Save changes
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        college: user.college,
        role: user.role || 'student',
        isOrganizer: user.isOrganizer || false,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
