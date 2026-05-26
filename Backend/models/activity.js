const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Activity = {
    getByProject: async (projectId) => {
        const [rows] = await db.query("SELECT * FROM project_activities WHERE project_id = ? ORDER BY data_krijimit DESC", [projectId]);
        return rows;
    }
};

module.exports = Activity;
