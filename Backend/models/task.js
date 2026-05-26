const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Task = {
    create: async (data) => {
        const { project_id, titulli, pershkrimi, statusi, data_afatit, prioriteti, sprint_id } = data;
        const [result] = await db.query(
            "INSERT INTO tasks (project_id, titulli, pershkrimi, statusi, data_afatit, prioriteti, sprint_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [project_id, titulli, pershkrimi, statusi, data_afatit, prioriteti, sprint_id]
        );
        return result.insertId;
    },
    updateStatus: async (id, statusi) => {
        await db.query("UPDATE tasks SET statusi = ? WHERE id = ?", [statusi, id]);
    },
    delete: async (id) => {
        await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    }
};

module.exports = Task;
