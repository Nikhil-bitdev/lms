const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

const models = {};
const basename = path.basename(__filename);

// Load all models first
fs.readdirSync(__dirname)
  .filter(file =>
    file !== basename &&
    file.endsWith('.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    const modelName = file.replace('.js', '');
    models[modelName] = model;
  });

// Define relationships after all models are loaded
models.User.hasMany(models.Course, { foreignKey: 'teacherId' });
models.Course.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });

models.Course.hasMany(models.Assignment, { foreignKey: 'courseId' });
models.Assignment.belongsTo(models.Course, { foreignKey: 'courseId' });

models.Course.hasMany(models.Quiz, { foreignKey: 'courseId' });
models.Quiz.belongsTo(models.Course, { foreignKey: 'courseId' });

models.Quiz.hasMany(models.QuizQuestion, { foreignKey: 'quizId' });
models.QuizQuestion.belongsTo(models.Quiz, { foreignKey: 'quizId' });

models.User.hasMany(models.Submission, { foreignKey: 'userId' });
models.Submission.belongsTo(models.User, { foreignKey: 'userId' });
models.Assignment.hasMany(models.Submission, { foreignKey: 'assignmentId' });
models.Submission.belongsTo(models.Assignment, { foreignKey: 'assignmentId' });

models.User.hasMany(models.QuizAttempt, { foreignKey: 'userId' });
models.QuizAttempt.belongsTo(models.User, { foreignKey: 'userId' });
models.Quiz.hasMany(models.QuizAttempt, { foreignKey: 'quizId' });
models.QuizAttempt.belongsTo(models.Quiz, { foreignKey: 'quizId' });

models.Course.hasMany(models.Discussion, { foreignKey: 'courseId' });
models.Discussion.belongsTo(models.Course, { foreignKey: 'courseId' });
models.User.hasMany(models.Discussion, { foreignKey: 'userId' });
models.Discussion.belongsTo(models.User, { foreignKey: 'userId' });

models.User.hasMany(models.Message, { as: 'sentMessages', foreignKey: 'senderId' });
models.User.hasMany(models.Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
models.Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
models.Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });

models.User.hasMany(models.Enrollment, { foreignKey: 'userId' });
models.Enrollment.belongsTo(models.User, { foreignKey: 'userId' });
models.Course.hasMany(models.Enrollment, { foreignKey: 'courseId' });
models.Enrollment.belongsTo(models.Course, { foreignKey: 'courseId' });

models.Course.hasMany(models.Material, { foreignKey: 'courseId' });
models.Material.belongsTo(models.Course, { foreignKey: 'courseId' });
models.User.hasMany(models.Material, { foreignKey: 'uploadedBy' });
models.Material.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploadedBy' });

module.exports = {
  sequelize,
  ...models
};