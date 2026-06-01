require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        console.log("Adding new columns to 'tasks' table...");
        
        // Use IGNORE errors if columns already exist
        try {
            await db.query("ALTER TABLE tasks ADD COLUMN data_fillimit DATE DEFAULT NULL");
            console.log("Added data_fillimit");
        } catch (e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        try {
            await db.query("ALTER TABLE tasks ADD COLUMN depends_on_task_id INT DEFAULT NULL");
            console.log("Added depends_on_task_id");
        } catch (e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        try {
            await db.query("ALTER TABLE tasks ADD COLUMN assigned_to INT DEFAULT NULL");
            console.log("Added assigned_to");
        } catch (e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        try {
            await db.query("ALTER TABLE tasks ADD COLUMN completed_at DATETIME DEFAULT NULL");
            console.log("Added completed_at");
        } catch (e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        console.log("Migration complete!");
    } catch(err) {
        console.error("Migration failed:", err);
    } finally {
        await db.end();
    }
}

migrate();
