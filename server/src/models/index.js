const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Course = require('./Course');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizAttempt = require('./QuizAttempt');
const Discussion = require('./Discussion');
const Message = require('./Message');
const Enrollment = require('./Enrollment');

// Define relationships
User.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

Course.hasMany(Assignment, { foreignKey: 'courseId' });
Assignment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Quiz, { foreignKey: 'courseId' });
Quiz.belongsTo(Course, { foreignKey: 'courseId' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId' });

User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });
Assignment.hasMany(Submission, { foreignKey: 'assignmentId' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });

User.hasMany(QuizAttempt, { foreignKey: 'userId' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId' });

Course.hasMany(Discussion, { foreignKey: 'courseId' });
Discussion.belongsTo(Course, { foreignKey: 'courseId' });
User.hasMany(Discussion, { foreignKey: 'userId' });
Discussion.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Enrollment (Many-to-Many relationship between User and Course)
User.belongsToMany(Course, { through: Enrollment });
Course.belongsToMany(User, { through: Enrollment });

module.exports = {
  sequelize,
  User,
  Course,
  Assignment,
  Submission,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Discussion,
  Message,
  Enrollment
};