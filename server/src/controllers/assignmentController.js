const { Assignment, Submission, User, Course } = require('../models');
const fs = require('fs').promises;
const path = require('path');

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, totalPoints, courseId } = req.body;
    let attachments = [];

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype
      }));
    }

    // Check if user has permission to create assignment in this course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create assignments in this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      totalPoints,
      courseId,
      attachments
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

// Get all assignments for a course
const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.findAll({
      where: { courseId },
      order: [['dueDate', 'ASC']]
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Error retrieving assignments' });
  }
};

// Get assignment by ID
const getAssignment = async (req, res) => {
  try {
    const includeOptions = [{
      model: Course,
      attributes: ['title', 'teacherId']
    }];
    
    // If student, include their submission to check if they've submitted
    if (req.user.role === 'student') {
      includeOptions.push({
        model: Submission,
        where: { userId: req.user.id },
        required: false,
        attributes: ['id', 'submittedAt', 'grade', 'status']
      });
    }
    
    const assignment = await Assignment.findByPk(req.params.id, {
      include: includeOptions
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Add submitted flag for students
    const assignmentJSON = assignment.toJSON();
    if (req.user.role === 'student') {
      assignmentJSON.submitted = assignmentJSON.Submissions && assignmentJSON.Submissions.length > 0;
      assignmentJSON.isSubmitted = assignmentJSON.submitted;
    }

    res.json({ assignment: assignmentJSON });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Error retrieving assignment' });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    let attachments = [];

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({
      where: {
        assignmentId,
        userId: req.user.id
      }
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        message: 'You have already submitted this assignment. Multiple submissions are not allowed.',
        error: 'ALREADY_SUBMITTED'
      });
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype
      }));
    }

    // Check if past due date
    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await Submission.create({
      content,
      attachments,
      assignmentId,
      userId: req.user.id,
      status: isLate ? 'late' : 'submitted'
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
};

// Grade submission
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findByPk(submissionId, {
      include: [{
        model: Assignment,
        include: [{ model: Course }]
      }]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user has permission to grade
    if (req.user.role !== 'admin' && submission.Assignment.Course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }

    await submission.update({
      grade,
      feedback,
      status: 'graded'
    });

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Error grading submission' });
  }
};

// Get all submissions for an assignment
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    console.log(`[Submissions] Fetching submissions for assignment ${assignmentId} by user ${req.user.id} (${req.user.role})`);
    
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course }]
    });

    if (!assignment) {
      console.log(`[Submissions] Assignment ${assignmentId} not found`);
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has permission to view submissions
    if (req.user.role !== 'admin' && assignment.Course.teacherId !== req.user.id) {
      console.log(`[Submissions] User ${req.user.id} not authorized. Course teacher is ${assignment.Course.teacherId}`);
      return res.status(403).json({ message: 'Not authorized to view submissions' });
    }

    const submissions = await Submission.findAll({
      where: { assignmentId },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    console.log(`[Submissions] Found ${submissions.length} submissions for assignment ${assignmentId}`);
    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Error retrieving submissions' });
  }
};

// Get all assignments for the logged-in user
const getUserAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let assignments = [];

    if (userRole === 'admin') {
      // For admins, get ALL assignments from ALL courses with teacher info
      assignments = await Assignment.findAll({
        include: [{
          model: Course,
          attributes: ['id', 'title', 'code', 'teacherId'],
          include: [{
            model: User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }],
        order: [['dueDate', 'ASC']]
      });
    } else if (userRole === 'teacher' || userRole === 'instructor') {
      // For teachers, get all assignments from their courses
      assignments = await Assignment.findAll({
        include: [{
          model: Course,
          where: { teacherId: userId },
          attributes: ['id', 'title', 'code']
        }],
        order: [['dueDate', 'ASC']]
      });
    } else {
      // For students, get assignments from courses they're enrolled in
      const { Enrollment } = require('../models');
      
      // Get enrolled courses
      const enrollments = await Enrollment.findAll({
        where: { userId, status: 'active' },
        attributes: ['courseId']
      });
      
      const enrolledCourseIds = enrollments.map(e => e.courseId);
      
      if (enrolledCourseIds.length > 0) {
        // Get assignments from enrolled courses
        assignments = await Assignment.findAll({
          where: { courseId: enrolledCourseIds },
          include: [{
            model: Course,
            attributes: ['id', 'title', 'code']
          }, {
            model: Submission,
            where: { userId },
            required: false,
            attributes: ['id', 'submittedAt', 'grade']
          }],
          order: [['dueDate', 'ASC']]
        });
        
        // Add isSubmitted and submitted flags for easier frontend handling
        assignments = assignments.map(assignment => {
          const assignmentJSON = assignment.toJSON();
          const hasSubmission = assignmentJSON.Submissions && assignmentJSON.Submissions.length > 0;
          assignmentJSON.isSubmitted = hasSubmission;
          assignmentJSON.submitted = hasSubmission; // For consistency with frontend
          return assignmentJSON;
        });
      }
    }

    res.json({ assignments });
  } catch (error) {
    console.error('Get user assignments error:', error);
    res.status(500).json({ message: 'Error retrieving assignments' });
  }
};

// Download assignment attachment
const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send file
    res.download(filePath);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

// Delete assignment (admin only)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findByPk(id, {
      include: [{
        model: Course,
        attributes: ['teacherId']
      }]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization: Admin can delete any, Teacher can delete their own
    if (req.user.role !== 'admin' && assignment.Course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    // Delete associated submissions first
    await Submission.destroy({
      where: { assignmentId: id }
    });

    // Delete assignment files if they exist
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const attachment of assignment.attachments) {
        try {
          const filePath = path.join(__dirname, '../../uploads', attachment.filename);
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
          // Continue even if file deletion fails
        }
      }
    }

    // Delete the assignment
    await assignment.destroy();

    res.json({ 
      message: 'Assignment deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  getUserAssignments,
  downloadAttachment,
  deleteAssignment
};