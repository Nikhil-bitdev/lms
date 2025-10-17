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
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [{
        model: Course,
        attributes: ['title', 'teacherId']
      }]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ assignment });
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
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course }]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has permission to view submissions
    if (req.user.role !== 'admin' && assignment.Course.teacherId !== req.user.id) {
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

    if (userRole === 'teacher' || userRole === 'instructor' || userRole === 'admin') {
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
        
        // Add isSubmitted flag for easier frontend handling
        assignments = assignments.map(assignment => {
          const assignmentJSON = assignment.toJSON();
          assignmentJSON.isSubmitted = assignmentJSON.Submissions && assignmentJSON.Submissions.length > 0;
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

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  getUserAssignments
};