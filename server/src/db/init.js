const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running migration...');
    await db.query(schemaSql);
    console.log('Migration completed.');

    // Seed Admin User
    const adminEmail = 'admin@shiv.com';
    const checkAdmin = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Admin user seeded: admin@shiv.com / admin123');
    } else {
        console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

initDb();
