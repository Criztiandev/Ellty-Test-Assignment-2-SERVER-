import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

export const initDatabase = () => {
  db.serialize(() => {
    // Create users table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        } else {
          console.log('Users table created or already exists');
        }
      }
    );

    // Create calculations table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER DEFAULT NULL,
        user_id INTEGER NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('+', '-', '*', '/', 'start')),
        number REAL NOT NULL,
        result REAL NOT NULL,
        depth INTEGER DEFAULT 0 CHECK(depth <= 50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES calculations(id) ON DELETE CASCADE
      )
    `,
      (err) => {
        if (err) {
          console.error('Error creating calculations table:', err.message);
        } else {
          console.log('Calculations table created or already exists');
        }
      }
    );

    // Create indexes for calculations table
    db.run('CREATE INDEX IF NOT EXISTS idx_parent_id ON calculations(parent_id)', (err) => {
      if (err) {
        console.error('Error creating parent_id index:', err.message);
      }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_user_id ON calculations(user_id)', (err) => {
      if (err) {
        console.error('Error creating user_id index:', err.message);
      }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_created_at ON calculations(created_at)', (err) => {
      if (err) {
        console.error('Error creating created_at index:', err.message);
      }
    });

    // Create password_reset_tokens table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
      (err) => {
        if (err) {
          console.error('Error creating password_reset_tokens table:', err.message);
        } else {
          console.log('Password reset tokens table created or already exists');
        }
      }
    );

    // Migration: Add username and role columns if they don't exist (for existing databases)
    db.run('ALTER TABLE users ADD COLUMN username TEXT', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding username column:', err.message);
      }
    });

    db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding role column:', err.message);
      }
    });
  });
};

export default db;
