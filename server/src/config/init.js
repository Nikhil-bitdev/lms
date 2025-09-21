const sequelize = require('./database');
const models = require('../models');

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;