require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    const [tasks] = await db.query("DESCRIBE tasks");
    console.log("TASKS TABLE:");
    console.table(tasks);

    const [sprints] = await db.query("DESCRIBE sprints");
    console.log("SPRINTS TABLE:");
    console.table(sprints);

    await db.end();
}

main().catch(console.error);
