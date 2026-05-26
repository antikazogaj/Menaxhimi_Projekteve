const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Project = {
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM projects");
        return rows;
    },
    create: async (data) => {
        const [result] = await db.query("INSERT INTO projects (emertimi, pershkrimi, statusi) VALUES (?, ?, ?)", [data.emertimi, data.pershkrimi || '', data.statusi || 'Active']);
        return result.insertId;
    }
};

module.exports = Project;
