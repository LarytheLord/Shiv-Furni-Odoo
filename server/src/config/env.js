require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DB_USER: process.env.POSTGRES_USER || 'admin',
  DB_PASSWORD: process.env.POSTGRES_PASSWORD || 'password123',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.POSTGRES_DB || 'shiv_furniture',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_key_shiv_furni',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
