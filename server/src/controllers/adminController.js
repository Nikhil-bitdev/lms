const crypto = require('crypto');
const { User, TeacherInvitation } = require('../models');
const { Op } = require('sequelize');
const { sendTeacherInvitation } = require('../services/emailService');

// Invite a teacher
const inviteTeacher = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    const adminId = req.user.id;

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered as a user' });
    }

    // Delete any existing invitations for this email (to allow resending)
    const deletedCount = await TeacherInvitation.destroy({ 
      where: { email } 
    });
    
    if (deletedCount > 0) {
      console.log(`♻️  Deleted ${deletedCount} old invitation(s) for ${email}, creating new one`);
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await TeacherInvitation.create({
      email,
      firstName,
      lastName,
      invitationToken,
      invitedBy: adminId,
      expiresAt,
      status: 'pending'
    });

    const invitationLink = `${process.env.CLIENT_URL}/register/teacher/${invitationToken}`;

    // Send invitation email
    const emailResult = await sendTeacherInvitation({
      email,
      firstName,
      lastName,
      invitationLink,
      expiresAt
    });

    res.status(201).json({
      message: emailResult.success 
        ? 'Teacher invitation sent successfully via email' 
        : 'Teacher invitation created (email not sent - check configuration)',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      },
      invitationLink,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Invite teacher error:', error);
    res.status(500).json({ message: 'Error creating teacher invitation' });
  }
};

// Get all teacher invitations
const getInvitations = async (req, res) => {
  try {
    const invitations = await TeacherInvitation.findAll({
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Error fetching invitations' });
  }
};

// Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
};

// Deactivate/Activate a teacher
const toggleTeacherStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ 
      where: { 
        id,
        role: 'teacher'
      } 
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.isActive = !teacher.isActive;
    await teacher.save();

    res.json({
      message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`,
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        isActive: teacher.isActive
      }
    });
  } catch (error) {
    console.error('Toggle teacher status error:', error);
    res.status(500).json({ message: 'Error updating teacher status' });
  }
};

// Revoke invitation
const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await TeacherInvitation.findByPk(id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Can only revoke pending invitations' });
    }

    invitation.status = 'expired';
    await invitation.save();

    res.json({ message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(500).json({ message: 'Error revoking invitation' });
  }
};

// Verify invitation token and register teacher
const registerTeacher = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find invitation
    const invitation = await TeacherInvitation.findOne({ 
      where: { 
        invitationToken: token,
        status: 'pending',
        expiresAt: { [Op.gt]: new Date() }
      } 
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: invitation.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create teacher account
    const teacher = await User.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      password,
      role: 'teacher',
      isActive: true
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Remove password from response
    const teacherResponse = teacher.toJSON();
    delete teacherResponse.password;

    res.status(201).json({
      message: 'Teacher account created successfully',
      teacher: teacherResponse
    });
  } catch (error) {
    console.error('Register teacher error:', error);
    res.status(500).json({ message: 'Error creating teacher account' });
  }
};

// Get invitation details by token (for registration page)
const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await TeacherInvitation.findOne({ 
      where: { 
        invitationToken: token,
        status: 'pending',
        expiresAt: { [Op.gt]: new Date() }
      },
      attributes: ['email', 'firstName', 'lastName', 'expiresAt']
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    res.json(invitation);
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: 'Error fetching invitation' });
  }
};

module.exports = {
  inviteTeacher,
  getInvitations,
  getTeachers,
  toggleTeacherStatus,
  revokeInvitation,
  registerTeacher,
  getInvitationByToken
};
