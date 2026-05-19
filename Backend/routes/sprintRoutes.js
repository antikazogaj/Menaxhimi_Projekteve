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

// 1. MARRJA E SPRINTEVE
router.get('/:projectId', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM sprints WHERE project_id = ?", [req.params.projectId]);
        res.json(rows);
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

// 3. FSHIRJA E SPRINTIT (DELETE)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM sprints WHERE id = ?", [id]);
        
        // Detyrat e këtij sprinti i bëjmë NULL (pa fazë) që të mos fshihen detyrat
        await db.query("UPDATE tasks SET sprint_id = NULL WHERE sprint_id = ?", [id]);

        res.json({ message: "Sprinti u fshi me sukses!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
});

module.exports = router;
