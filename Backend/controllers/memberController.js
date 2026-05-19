const mysql = require('mysql2');

// Kriojmë lidhjen direkte me databazën që të mos kesh errore
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}).promise();

const addMemberByEmail = async (req, res) => {
    try {
        const { project_id, email, roli } = req.body;

        // 1. Gjejmë përdoruesin përmes email-it
        const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Ky përdorues nuk ekziston!" });
        }

        const userId = users[0].id;

        // 2. Kontrollojmë nëse është shtuar më parë
        const [exists] = await db.query("SELECT * FROM project_members WHERE project_id = ? AND user_id = ?", [project_id, userId]);

        if (exists.length > 0) {
            return res.status(400).json({ message: "Përdoruesi është pjesë e projektit!" });
        }

        // 3. E shtojmë në projekt
        await db.query("INSERT INTO project_members (project_id, user_id, roli_ne_projekt) VALUES (?, ?, ?)", 
            [project_id, userId, roli || 'Member']);

        res.status(201).json({ message: "Anëtari u shtua me sukses!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
};

const getProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [members] = await db.query(
            `SELECT users.name, users.email, project_members.roli_ne_projekt 
             FROM project_members 
             JOIN users ON project_members.user_id = users.id 
             WHERE project_members.project_id = ?`, [projectId]
        );
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë marrjes së anëtarëve", error: error.message });
    }
};

module.exports = { addMemberByEmail, getProjectMembers };
