const mysql = require('mysql2/promise');

// Krijo lidhjen me databazën (sigurohu që variablat në .env janë saktë)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const sprintController = {
    // 1. Marrja e të gjitha fazave për një projekt
    getSprints: async (req, res) => {
        try {
            const { projectId } = req.params;
            const [rows] = await db.query("SELECT * FROM sprints WHERE project_id = ?", [projectId]);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Krijimi i një faze të re
    createSprint: async (req, res) => {
        try {
            const { project_id, emertimi, statusi } = req.body;
            const [result] = await db.query(
                "INSERT INTO sprints (project_id, emertimi, statusi) VALUES (?, ?, ?)",
                [project_id, emertimi, statusi || 'Active']
            );
            res.status(201).json({ id: result.insertId, message: "Sprinti u krijua!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. FSHIRJA E FAZËS 
    deleteSprint: async (req, res) => {
        try {
            const { id } = req.params;
            // Fshijmë sprintin
            await db.query("DELETE FROM sprints WHERE id = ?", [id]);
            
            // Opsionale: Detyrat që ishin në këtë sprint i bëjmë "NULL" që të mos fshihen
            await db.query("UPDATE tasks SET sprint_id = NULL WHERE sprint_id = ?", [id]);

            res.status(200).json({ message: "Sprinti u fshi me sukses!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gabim gjatë fshirjes" });
        }
    }
};

module.exports = sprintController;
