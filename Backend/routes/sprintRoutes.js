const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Përdorim këtë direkt këtu
const verifyToken = require('../middleware/authMiddleware');

// Krijojmë lidhjen me DB direkt këtu që të mos lypë file tjetër
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// --- MARRJA E FAZAVE (SPRINTS) TË NJË PROJEKTI ---
// Kur Frontend bën GET te /api/sprints/5, ne i kthejmë të gjitha fazat për projektin me ID 5
router.get('/:projectId', verifyToken, async (req, res) => {
    try {
        // Përdorim Query në DB (MySQL)
        const [rows] = await db.query("SELECT * FROM sprints WHERE project_id = ?", [req.params.projectId]);
        res.json(rows); // Ia dërgojmë Frontendit në format JSON
    } catch (err) {
        res.status(500).json({ message: "Gabim te marrja e sprinteve" });
    }
});

// 2. KRIJIMI I SPRINTIT
router.post('/', verifyToken, async (req, res) => {
    try {
        const { project_id, emertimi, statusi } = req.body;
        const [result] = await db.query(
            "INSERT INTO sprints (project_id, emertimi, statusi) VALUES (?, ?, ?)",
            [project_id, emertimi, statusi || 'Active']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ message: "Gabim gjatë krijimit" });
    }
});

// --- FSHIRJA E SPRINTIT (DELETE) ---
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // ID-ja e sprintit që do fshihet
        await db.query("DELETE FROM sprints WHERE id = ?", [id]);
        
        // Pjesë e rëndësishme e logjikës:
        // Detyrat e këtij sprinti i bëjmë NULL (pa fazë) në mënyrë që të mos i fshijmë dhe ato
        await db.query("UPDATE tasks SET sprint_id = NULL WHERE sprint_id = ?", [id]);

        res.json({ message: "Sprinti u fshi me sukses!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
});

// --- BURNDOWN CHART DATA (TË DHËNAT PËR GRAFIKUN E ZJARRIT) ---
// Ky Endpoint kthen numrin e detyrave dhe statusin e tyre specifikisht për t'u vizatuar në grafikun Burndown
router.get('/:id/burndown', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Gjejmë fillimisht fazën
        const [sprint] = await db.query("SELECT * FROM sprints WHERE id = ?", [id]);
        if (sprint.length === 0) return res.status(404).json({message: "Sprint not found"});
        
        // Gjejmë të gjitha detyrat brenda kësaj faze, por vetëm kolonat e nevojshme (id, statusi, datat)
        const [tasks] = await db.query("SELECT id, statusi, completed_at, data_fillimit FROM tasks WHERE sprint_id = ?", [id]);
        
        // I kthejmë të paketuara për Frontend
        res.json({
            sprint: sprint[0],
            tasks: tasks
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gabim te burndown" });
    }
});

module.exports = router;
