const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Comment = {
    getByTask: async (taskId) => {
        const [rows] = await db.query("SELECT * FROM task_comments WHERE task_id = ? ORDER BY data ASC", [taskId]);
        return rows;
    },
    create: async (taskId, userId, komenti) => {
        const [result] = await db.query("INSERT INTO task_comments (task_id, user_id, komenti) VALUES (?, ?, ?)", [taskId, userId, komenti]);
        return result.insertId;
    }
};

module.exports = Comment;
