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
        await db.query(`
        CREATE TABLE IF NOT EXISTS \`time_logs\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`task_id\` int(11) DEFAULT NULL,
            \`user_id\` int(11) DEFAULT NULL,
            \`duration_minutes\` int(11) DEFAULT NULL,
            \`data\` timestamp NOT NULL DEFAULT current_timestamp(),
            PRIMARY KEY (\`id\`),
            KEY \`task_id\` (\`task_id\`),
            KEY \`user_id\` (\`user_id\`),
            CONSTRAINT \`time_logs_ibfk_1\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`time_logs_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log("Table 'time_logs' created successfully.");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        process.exit();
    }
}

run();
