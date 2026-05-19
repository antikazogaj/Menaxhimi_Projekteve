const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const verifyToken = require('../middleware/authMiddleware');

// 1. LIDHJA ME DATABAZËN (Pool)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// 2. KONFIGURIMI I MULTER (Ku dhe si ruhen fotot)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Sigurohu që ky folder ekziston në Backend
    },
    filename: (req, file, cb) => {
        // I japim emër unik: Koha_Aktuale.prapashtesa
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limiti 5MB
});

// 3. RRUGA PËR UPLOAD (POST /api/attachments/upload)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        // Kontrollojmë nëse Multer e ka kapur skedarin
        if (!req.file) {
            return res.status(400).json({ message: "Asnjë skedar nuk u zgjodh!" });
        }

        const { task_id } = req.body;
        const filePath = req.file.filename;

        if (!task_id) {
            return res.status(400).json({ message: "Mungon ID e detyrës!" });
        }

        // Ruajmë informacionin në tabelën MySQL
     const sql = "INSERT INTO task_attachments (task_id, emri_skedarit, rruga) VALUES (?, ?, ?)";
     await db.query(sql, [task_id, req.file.originalname, req.file.filename]);

        res.status(200).json({ 
            message: " Skedari u ngarkua me sukses!",
            file: filePath 
        });

    } catch (error) {
        console.error("Gabim te Attachments:", error);
        res.status(500).json({ message: "Gabim në server!", error: error.message });
    }
});

// 4. RRUGA PËR MARRJEN E SKEDARËVE TË NJË DETYRE (GET)
router.get('/:taskId', verifyToken, async (req, res) => {
    try {
        const { taskId } = req.params;
        const [rows] = await db.query("SELECT * FROM attachments WHERE task_id = ?", [taskId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
