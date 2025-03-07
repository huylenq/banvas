import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { drawings, users } from '@shared/schema';
import { log } from './vite';

const { Pool } = pg;

// Get DATABASE_URL from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool);

// Setup function to initialize the database
export async function setupDatabase() {
  try {
    log('Setting up database connection...', 'database');
    
    // Perform simple query to test connection
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      log('Successfully connected to database', 'database');
    } finally {
      client.release();
    }
    
    // Create tables if they don't exist
    await createTablesIfNotExist();
    
    log('Database setup complete', 'database');
  } catch (error) {
    log(`Database setup error: ${error}`, 'database');
    throw error;
  }
}

// Create tables if they don't exist
async function createTablesIfNotExist() {
  const client = await pool.connect();
  try {
    log('Creating tables if they don\'t exist...', 'database');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    
    // Create drawings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drawings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    log('Tables created successfully', 'database');
  } catch (error) {
    log(`Error creating tables: ${error}`, 'database');
    throw error;
  } finally {
    client.release();
  }
}