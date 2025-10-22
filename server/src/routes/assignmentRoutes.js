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

// Get all assignments for logged-in user (must be before /:id)
router.get(
  '/user/all',
  auth,
  assignmentController.getUserAssignments
);

// Download assignment attachment (must be before /:id)
router.get(
  '/download/:filename',
  auth,
  assignmentController.downloadAttachment
);

// Get all assignments for a course
router.get(
  '/course/:courseId',
  auth,
  assignmentController.getCourseAssignments
);

// Get all submissions for an assignment (teachers and admins only)
router.get(
  '/:assignmentId/submissions',
  auth,
  authorize('teacher', 'admin'),
  assignmentController.getAssignmentSubmissions
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

// Delete assignment (admin and teacher only) - must be before GET /:id
router.delete(
  '/:id',
  auth,
  authorize('admin', 'teacher'),
  assignmentController.deleteAssignment
);

// Get single assignment (should be last among /:id routes)
router.get(
  '/:id',
  auth,
  assignmentController.getAssignment
);

module.exports = router;