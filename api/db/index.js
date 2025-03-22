import pkg from 'pg';
import util from 'util';
import 'dotenv/config';

const { Pool } = pkg;

const sql_pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost', // Default to localhost if not provided
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
    max: process.env.DB_MAX || 10, // Max connections
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
});


const pool = {
    query: (sql, args) => {
        return util.promisify(sql_pool.query).call(sql_pool, sql,args);
    }
}

export default pool;