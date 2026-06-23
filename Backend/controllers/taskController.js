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
            SELECT t.*, l.emertimi as label_emertimi, l.ngjyra, l.id as label_id, u.name as assigned_to_name, u.avatar_url as assigned_to_avatar
            FROM tasks t
            LEFT JOIN task_labels tl ON t.id = tl.task_id
            LEFT JOIN labels l ON tl.label_id = l.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = ?
        `;
        const [tasks] = await db.query(sql, [id]);

        const tasksFullData = await Promise.all(tasks.map(async (task) => {
            // 1. Marrim Fotot
            const [photos] = await db.query("SELECT id, rruga FROM task_attachments WHERE task_id = ?", [task.id]);
            
            // 2. Marrim Komentet (bashkojmë me tabelën users për me ia pa emrin dhe avatarin)
            const [comments] = await db.query(`
                SELECT c.*, u.name as perdoruesi, u.avatar_url as user_avatar 
                FROM task_comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.task_id = ? 
                ORDER BY c.data ASC`, 
            [task.id]);

            // 3. Marrim Time Logs (Koha e punës)
            const [timeLogs] = await db.query(`
                SELECT tl.*, u.name as user_name, u.avatar_url as user_avatar 
                FROM time_logs tl 
                JOIN users u ON tl.user_id = u.id 
                WHERE tl.task_id = ? 
                ORDER BY tl.data DESC`, 
            [task.id]);

            return { ...task, attachments: photos || [], comments: comments || [], time_logs: timeLogs || [] };
        }));

        res.status(200).json(tasksFullData);
    } catch (error) {
        res.status(500).json({ error: "Gabim te marrja e të dhënave!" });
    }
};


// 3. Krijo detyrë
const createTask = async (req, res) => {
    try {
        const { project_id, titulli, pershkrimi, statusi, data_fillimit, data_afatit, prioriteti, label_id, sprint_id, depends_on_task_id, assigned_to } = req.body;
        const taskId = await Task.create({
            project_id, titulli, pershkrimi: pershkrimi || '',
            statusi: statusi || 'To Do', data_fillimit, data_afatit,
            prioriteti: prioriteti || 'Medium', sprint_id: sprint_id || null, depends_on_task_id: depends_on_task_id || null,
            assigned_to: assigned_to || null
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
        const taskId = req.params.id;
        const userId = req.user.id;
        
        // Gjejmë project_id të detyrës
        const [taskData] = await db.query("SELECT project_id FROM tasks WHERE id = ?", [taskId]);
        if (taskData.length === 0) return res.status(404).json({ error: "Detyra nuk u gjet" });
        const projectId = taskData[0].project_id;
        
        // Verifikojmë rolin në projekt
        const [memberData] = await db.query("SELECT roli_ne_projekt FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, userId]);
        if (memberData.length === 0 || memberData[0].roli_ne_projekt !== 'Admin') {
            return res.status(403).json({ error: "Nuk keni të drejtë të fshini detyra!" });
        }

        await Task.delete(taskId);
        res.status(200).json({ message: "U fshi!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5b. Update Task Label
const updateTaskLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const { label_id } = req.body;
        
        await db.query("DELETE FROM task_labels WHERE task_id = ?", [id]);
        
        if (label_id) {
            await db.query("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)", [id, label_id]);
        }
        
        res.status(200).json({ message: "Etiketa u përditësua!" });
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

module.exports = { getAllUserTasks, getProjectTasks, createTask, updateTaskStatus, updateTaskLabel, deleteTask, getTaskStats };
