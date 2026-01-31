const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const results = {
    dbConnection: false,
    filesValid: true,
    errors: []
};

async function verify() {
    // 1. Check DB Connection
    try {
        const client = new Client({
            user: process.env.POSTGRES_USER || 'admin',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'shiv_furniture',
            password: process.env.POSTGRES_PASSWORD || 'password123',
            port: process.env.DB_PORT || 5432,
        });
        await client.connect();
        await client.query('SELECT NOW()');
        await client.end();
        results.dbConnection = true;
    } catch (err) {
        results.errors.push(`DB Connection Failed: ${err.message}`);
    }

    // 2. Check File Imports (Syntax & Dependencies)
    const srcDir = path.join(__dirname, 'src');
    
    function checkDir(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                checkDir(filePath);
            } else if (file.endsWith('.js')) {
                try {
                    require(filePath);
                } catch (err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                         // Ignore missing local config or similar if not critical, but log it
                         results.errors.push(`Module not found in ${file}: ${err.message}`);
                         results.filesValid = false;
                    } else {
                         results.errors.push(`Error loading ${file}: ${err.message}`);
                         results.filesValid = false;
                    }
                }
            }
        }
    }

    try {
        checkDir(srcDir);
    } catch (err) {
        results.errors.push(`Traversal Error: ${err.message}`);
    }

    // Write results
    fs.writeFileSync(path.join(__dirname, 'verification_result.json'), JSON.stringify(results, null, 2));
}

verify();
