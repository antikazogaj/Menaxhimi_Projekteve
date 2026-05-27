const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Label = {
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM labels");
        return rows;
    },
    create: async (emertimi, ngjyra) => {
        const [result] = await db.query("INSERT INTO labels (emertimi, ngjyra) VALUES (?, ?)", [emertimi, ngjyra]);
        return result.insertId;
    },
    delete: async (id) => {
        await db.query("DELETE FROM labels WHERE id = ?", [id]);
    }
};

module.exports = Label;
