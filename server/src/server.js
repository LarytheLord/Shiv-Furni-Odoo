const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

const startServer = async () => {
  try {
    // Test DB Connection
    await db.query('SELECT NOW()');
    console.log('Database connected successfully.');

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
};

startServer();
