const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const db = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        await db.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL");
        console.log("Column avatar_url added to users table.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error("Error modifying table:", e);
        }
    } finally {
        process.exit();
    }
}

run();
