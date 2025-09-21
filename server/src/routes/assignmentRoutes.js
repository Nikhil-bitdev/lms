const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createAssignmentValidation } = require('../middleware/validations/assignmentValidation');

// Create new assignment (teachers and admins only)
router.post(
  '/',
  auth,
  authorize('teacher', 'admin'),
  upload.array('files', 5),
  createAssignmentValidation,
  validate,
  assignmentController.createAssignment
);

// Get all assignments for a course
router.get(
  '/course/:courseId',
  auth,
  assignmentController.getCourseAssignments
);

// Get single assignment
router.get(
  '/:id',
  auth,
  assignmentController.getAssignment
);

// Submit assignment (students only)
router.post(
  '/:assignmentId/submit',
  auth,
  authorize('student'),
  upload.array('files', 5),
  assignmentController.submitAssignment
);

// Grade submission (teachers and admins only)
router.post(
  '/submissions/:submissionId/grade',
  auth,
  authorize('teacher', 'admin'),
  assignmentController.gradeSubmission
);

// Get all submissions for an assignment (teachers and admins only)
router.get(
  '/:assignmentId/submissions',
  auth,
  authorize('teacher', 'admin'),
  assignmentController.getAssignmentSubmissions
);

module.exports = router;