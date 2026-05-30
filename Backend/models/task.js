const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const Task = {
    create: async (data) => {
        const { project_id, titulli, pershkrimi, statusi, data_fillimit, data_afatit, prioriteti, sprint_id, depends_on_task_id } = data;
        const [result] = await db.query(
            "INSERT INTO tasks (project_id, titulli, pershkrimi, statusi, data_fillimit, data_afatit, prioriteti, sprint_id, depends_on_task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [project_id, titulli, pershkrimi, statusi, data_fillimit || null, data_afatit || null, prioriteti, sprint_id || null, depends_on_task_id || null]
        );
        return result.insertId;
    },
    updateStatus: async (id, statusi) => {
        const completedAt = statusi === 'Done' ? new Date() : null;
        await db.query("UPDATE tasks SET statusi = ?, completed_at = ? WHERE id = ?", [statusi, completedAt, id]);
    },
    delete: async (id) => {
        await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    }
};

module.exports = Task;
