const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation
} = require('../middleware/validations/authValidation');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Teacher registration via invitation
router.get('/register/teacher/:token', adminController.getInvitationByToken);
router.post('/register/teacher/:token', adminController.registerTeacher);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;