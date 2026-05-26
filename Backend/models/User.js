const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    },
    create: async ({ name, email, password, role }) => {
        const [result] = await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
        return result.insertId;
    },
    getAll: async () => {
        const [rows] = await db.query("SELECT id, name, email, role FROM users");
        return rows;
    },
    updateRole: async (id, role) => {
        await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    },
    delete: async (id) => {
        await db.query("DELETE FROM users WHERE id = ?", [id]);
    }
};

module.exports = User;
