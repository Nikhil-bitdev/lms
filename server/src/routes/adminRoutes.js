const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// Teacher invitation management
router.post('/teachers/invite', adminController.inviteTeacher);
router.get('/teachers/invitations', adminController.getInvitations);
router.delete('/teachers/invitations/:id', adminController.revokeInvitation);

// Teacher management
router.get('/teachers', adminController.getTeachers);
router.patch('/teachers/:id/toggle-status', adminController.toggleTeacherStatus);

module.exports = router;
