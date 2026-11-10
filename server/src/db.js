const dotenv = require('dotenv');
dotenv.config();

const pg =  require('pg');
const Pool = pg.Pool;
const databaseAddress = process.env.DATABASE_URL;
const pool = new Pool({connectionString: databaseAddress,});
module.exports = pool;