const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

// Force SQLite for development to avoid database connection issues
console.log('Using SQLite for development database.');
sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_STORAGE || 'server/dev.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;