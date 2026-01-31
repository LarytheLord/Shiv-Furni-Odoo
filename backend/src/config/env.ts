import dotenv from 'dotenv';

dotenv.config();

interface Environment {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    APP_NAME: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${key} is required`);
    }
    return value;
}

export const env: Environment = {
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    PORT: parseInt(getEnvVar('PORT', '5001'), 10),
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
    CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
    APP_NAME: getEnvVar('APP_NAME', 'Shiv Furniture Budget System')
};

export default env;
