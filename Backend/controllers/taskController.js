const Task = require('../models/task');
const Activity = require('../models/activity');
const mysql = require('mysql2/promise');

// ============================================================================
// KONTROLLUESI I DETYRAVE (Task Controller)
// Për Profesorin: Ky është "Truri" për detyrat. Kur Frontend-i thotë "Dua detyrat e projektit 5",
// kërkesa vjen këtu. Ky skedar flet me bazën e të dhënave, merr formaton të dhënat dhe ia kthen Frontend-it.
// Kemi përdorur Promise (.then/await) që serveri të mos bllokohet kur pret përgjigje nga databaza.
// ============================================================================

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

// 2. Detyrat e një projekti specifik
const getProjectTasks = async (req, res) => {
    try {
        const { id } = req.params; // Marrja e ID-së së projektit nga URL-ja (psh. /api/tasks/5)
        
        // Për Profesorin: Këtu bëjmë "LEFT JOIN" (Bashkim të tabelave).
        // Një detyrë ka lidhje me shumë gjëra (Kush e ka marrë përsipër? Çfarë etikete ka?).
        // Në vend që t'i kërkojmë këto të dhëna veç e veç, ne i marrim me 1 pyetësor të vetëm.
        const sql = `
            SELECT t.*, l.emertimi as label_emertimi, l.ngjyra, l.id as label_id, u.name as assigned_to_name, u.avatar_url as assigned_to_avatar
            FROM tasks t
            LEFT JOIN task_labels tl ON t.id = tl.task_id
            LEFT JOIN labels l ON tl.label_id = l.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = ?
        `;
        const [tasks] = await db.query(sql, [id]);

        // "Promise.all" pret që të përfundojnë të gjitha kërkimet në databazë për çdo detyrë para se të kthejë përgjigje.
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


// 3. Krijo detyrë të re
const createTask = async (req, res) => {
    try {
        // "Destructuring": Marrim vetëm të dhënat që na duhen nga kërkesa e klientit
        const { project_id, titulli, pershkrimi, statusi, data_fillimit, data_afatit, prioriteti, label_id, sprint_id, depends_on_task_id, assigned_to } = req.body;
        
        // Përdorim Modelin "Task" për ta ruajtur në databazë
        const taskId = await Task.create({
            project_id, titulli, pershkrimi: pershkrimi || '',
            statusi: statusi || 'To Do', data_fillimit, data_afatit,
            prioriteti: prioriteti || 'Medium', sprint_id: sprint_id || null, depends_on_task_id: depends_on_task_id || null,
            assigned_to: assigned_to || null
        });
        
        // Nëse përdoruesi ka zgjedhur një etiketë (Label psh. "Bug"), e ruajmë në tabelën ndërmjetëse
        if (label_id) await db.query("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)", [taskId, label_id]);

        // LOGIMI I AKTIVITETIT
        const userId = req.user.id;
        await Activity.logActivity(project_id, userId, 'Shtoi Detyrë', `Krijoi detyrën "${titulli}"`);

        // Njoftimi
        if (assigned_to) {
            const Notification = require('../models/Notification');
            const [projectInfo] = await db.query("SELECT emertimi FROM projects WHERE id = ?", [project_id]);
            const projectName = projectInfo.length > 0 ? projectInfo[0].emertimi : '';
            await Notification.create(assigned_to, `Jeni caktuar në detyrën: "${titulli}" te projekti ${projectName}`, `/projects/${project_id}`);
        }

        res.status(201).json({ id: taskId });
    } catch (error) {
        console.error("Gabim në createTask:", error);
        res.status(500).json({ error: error.message });
    }
};

// 4. Update Status
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statusi } = req.body;
        
        // Gjej emrin e detyres per ta loguar
        const [taskData] = await db.query("SELECT project_id, titulli FROM tasks WHERE id = ?", [id]);
        
        await Task.updateStatus(id, statusi);
        
        // LOGIMI I AKTIVITETIT
        if (taskData.length > 0) {
            const userId = req.user.id;
            await Activity.logActivity(taskData[0].project_id, userId, 'Ndryshoi Status', `Kaloi detyrën "${taskData[0].titulli}" në [${statusi}]`);
        }

        res.status(200).json({ message: "U përditësua!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Fshij detyrë
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id; // Kjo vjen nga "authMiddleware" pasi ka verifikuar token-in!
        
        // 1. Gjejmë cilit projekt i përket kjo detyrë
        const [taskData] = await db.query("SELECT project_id, titulli FROM tasks WHERE id = ?", [taskId]);
        if (taskData.length === 0) return res.status(404).json({ error: "Detyra nuk u gjet" });
        const projectId = taskData[0].project_id;
        
        // 2. Verifikojmë rolin e personit që po provon ta fshijë.
        // Pse? Siguria! Vetëm personat me rolin "Admin" në këtë projekt mund të fshijnë detyra.
        const [memberData] = await db.query("SELECT roli_ne_projekt FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, userId]);
        if (memberData.length === 0 || memberData[0].roli_ne_projekt !== 'Admin') {
            return res.status(403).json({ error: "Nuk keni të drejtë të fshini detyra!" });
        }

        // 3. Pasi u verifikua roli, bëjmë fshirjen
        const titulli = taskData[0].titulli;
        await Task.delete(taskId);
        
        // LOGIMI I AKTIVITETIT
        await Activity.logActivity(projectId, userId, 'Fshiu Detyrë', `Fshiu detyrën "${titulli}"`);

        res.status(200).json({ message: "U fshi me sukses!" });
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
