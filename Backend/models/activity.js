const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Activity = {
    // Merr aktivitetet për një projekt të caktuar
    getByProject: async (projectId) => {
        const [rows] = await db.query(`
            SELECT a.*, u.name as user_name, u.avatar_url as avatar 
            FROM activity_log a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.project_id = ? 
            ORDER BY a.data DESC
        `, [projectId]);
        return rows;
    },

    // Shto një aktivitet të ri
    logActivity: async (projectId, userId, veprimi, pershkrimi) => {
        const [result] = await db.query(
            "INSERT INTO activity_log (project_id, user_id, veprimi, pershkrimi) VALUES (?, ?, ?, ?)",
            [projectId, userId, veprimi, pershkrimi]
        );
        return result.insertId;
    },

    // Merr aktivitetet e gjithë projekteve ku përdoruesi është i përfshirë (për faqen Historiku)
    getUserActivities: async (userId) => {
        const [rows] = await db.query(`
            SELECT a.*, p.emertimi as project_name, u.name as user_name, u.avatar_url as avatar 
            FROM activity_log a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = ?
                UNION
                SELECT id FROM projects WHERE owner_id = ?
            )
            ORDER BY a.data DESC
            LIMIT 50
        `, [userId, userId]);
        return rows;
    }
};

module.exports = Activity;
