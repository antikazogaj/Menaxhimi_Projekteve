const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Notification = {
    // Krijimi i një njoftimi të ri
    create: async (userId, message, link = null) => {
        const [result] = await db.query(
            "INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)",
            [userId, message, link]
        );
        return result.insertId;
    },

    // Marrja e të gjitha njoftimeve për një përdorues të caktuar
    getByUser: async (userId) => {
        const [rows] = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY data DESC",
            [userId]
        );
        return rows;
    },

    // Marrja e njoftimeve TË PALEXUARA
    getUnreadByUser: async (userId) => {
        const [rows] = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY data DESC",
            [userId]
        );
        return rows;
    },

    // Shënjo një njoftim specifik si të lexuar
    markAsRead: async (id) => {
        await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
    },

    // Shënjo TË GJITHA njoftimet si të lexuara për një përdorues
    markAllAsRead: async (userId) => {
        await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
    }
};

module.exports = Notification;
