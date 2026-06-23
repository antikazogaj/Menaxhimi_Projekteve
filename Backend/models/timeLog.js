const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const TimeLog = {
    getByTask: async (taskId) => {
        const [rows] = await db.query(`
            SELECT tl.*, u.name as user_name 
            FROM time_logs tl 
            JOIN users u ON tl.user_id = u.id 
            WHERE tl.task_id = ? 
            ORDER BY tl.data DESC
        `, [taskId]);
        return rows;
    },
    create: async (taskId, userId, durationMinutes) => {
        const [result] = await db.query(
            "INSERT INTO time_logs (task_id, user_id, duration_minutes) VALUES (?, ?, ?)", 
            [taskId, userId, durationMinutes]
        );
        return result.insertId;
    },
    delete: async (id) => {
        await db.query("DELETE FROM time_logs WHERE id = ?", [id]);
    },
    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM time_logs WHERE id = ?", [id]);
        return rows[0];
    },
    getStats: async () => {
        const [rows] = await db.query(`
            SELECT u.name, SUM(tl.duration_minutes) as total_minutes 
            FROM time_logs tl 
            JOIN users u ON tl.user_id = u.id 
            GROUP BY u.id
        `);
        return rows;
    }
};

module.exports = TimeLog;
