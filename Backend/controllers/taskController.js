const Task = require('../models/task');
const Activity = require('../models/activity');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 1. Të gjitha detyrat
const getAllUserTasks = async (req, res) => {
    try {
        const [tasks] = await db.query("SELECT * FROM tasks");
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Detyrat e projektit 

const getProjectTasks = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT t.*, l.emertimi as label_emertimi, l.ngjyra
            FROM tasks t
            LEFT JOIN task_labels tl ON t.id = tl.task_id
            LEFT JOIN labels l ON tl.label_id = l.id
            WHERE t.project_id = ?
        `;
        const [tasks] = await db.query(sql, [id]);

        const tasksFullData = await Promise.all(tasks.map(async (task) => {
            // 1. Marrim Fotot
            const [photos] = await db.query("SELECT id, rruga FROM task_attachments WHERE task_id = ?", [task.id]);
            
            // 2. Marrim Komentet (bashkojmë me tabelën users për me ia pa emrin)
            const [comments] = await db.query(`
                SELECT c.*, u.name as perdoruesi 
                FROM task_comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.task_id = ? 
                ORDER BY c.data ASC`, 
            [task.id]);

            return { ...task, attachments: photos || [], comments: comments || [] };
        }));

        res.status(200).json(tasksFullData);
    } catch (error) {
        res.status(500).json({ error: "Gabim te marrja e të dhënave!" });
    }
};


// 3. Krijo detyrë
const createTask = async (req, res) => {
    try {
        const { project_id, titulli, pershkrimi, statusi, data_afatit, prioriteti, label_id, sprint_id } = req.body;
        const taskId = await Task.create({
            project_id, titulli, pershkrimi: pershkrimi || '',
            statusi: statusi || 'To Do', data_afatit,
            prioriteti: prioriteti || 'Medium', sprint_id: sprint_id || null
        });
        if (label_id) await db.query("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)", [taskId, label_id]);
        res.status(201).json({ id: taskId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update Status
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statusi } = req.body;
        await Task.updateStatus(id, statusi);
        res.status(200).json({ message: "U përditësua!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Fshij detyrë
const deleteTask = async (req, res) => {
    try {
        await Task.delete(req.params.id);
        res.status(200).json({ message: "U fshi!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Stats
const getTaskStats = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT SUM(CASE WHEN statusi = 'Done' THEN 1 ELSE 0 END) as done, SUM(CASE WHEN statusi != 'Done' THEN 1 ELSE 0 END) as pending FROM tasks`);
        res.status(200).json(rows[0] || { done: 0, pending: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUserTasks, getProjectTasks, createTask, updateTaskStatus, deleteTask, getTaskStats };
