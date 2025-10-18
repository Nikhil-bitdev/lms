const sequelize = require('./database');
const models = require('../models');

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with the database
    // Using basic sync without alter to avoid backup table conflicts
    // Models are already defined correctly, just ensure tables exist
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    console.log('Database file location:', process.env.SQLITE_STORAGE || 'server/dev.sqlite');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;