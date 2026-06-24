const mysql = require('mysql2/promise');

// ============================================================================
// MODELI I PËRDORUESIT (User Model)
// Për Profesorin: Ne po përdorim arkitekturën "MVC" (Model-View-Controller).
// Ky skedar është "Modeli". Ai është I VETMI që flet direkt me databazën.
// Controller-i nuk e prek databazën, por i kërkon Modelit t'i sjellë të dhënat.
// Kjo i bën gjërat më të sigurta dhe të organizuara.
// ============================================================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const User = {
    // Kërkon nëse ekziston një email i tillë në sistem (përdoret për Login)
    findByEmail: async (email) => {
        // Shenja "?" ruan nga "SQL Injection". Shmang hakimet ku përdoruesi mund të dërgojë kod SQL të rrezikshëm.
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    },
    
    // Krijimi i një llogarie të re
    create: async ({ name, email, password, role }) => {
        const [result] = await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
        return result.insertId; // Kthejmë ID-në e krijuar
    },
    
    // Merr të gjithë përdoruesit (por nuk e marrim fjalëkalimin për arsye sigurie!)
    getAll: async () => {
        const [rows] = await db.query("SELECT id, name, email, role, avatar_url FROM users");
        return rows;
    },
    
    // Ndryshimi i rolit nga Admin (psh. nga "Member" në "Admin")
    updateRole: async (id, role) => {
        await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    },
    
    // Fshirja e një përdoruesi nga platforma
    delete: async (id) => {
        await db.query("DELETE FROM users WHERE id = ?", [id]);
    },
    
    // Ngarkimi / Përditësimi i fotos së profilit (Avatar)
    updateAvatar: async (id, avatar_url) => {
        await db.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatar_url, id]);
    }
};

module.exports = User;
