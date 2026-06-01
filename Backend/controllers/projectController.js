const Project = require('../models/project'); 
const mysql = require('mysql2/promise');

// Krijojmë një lidhje të shpejtë për Sprints 
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 1. Funksioni për të marrë të gjitha projektet (READ)
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.getAll();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ 
            message: "Gabim gjatë marrjes së projekteve", 
            error: error.message 
        });
    }
};

// 2. Funksioni për krijimin e një projekti të ri (CREATE) + AUTO SPRINT + AUTO ADMIN
const createProject = async (req, res) => {
    try {
        if (!req.body.emertimi) {
            return res.status(400).json({ message: "Emërtimi i projektit është i detyrueshëm!" });
        }

        // Marrim ID-në e përdoruesit që po krijon projektin (nga tokeni JWT)
        const userId = req.user.id;

        // 1. Krijojmë projektin
        const projectId = await Project.create(req.body);

        // 2. SHTESA: Krijuesi i projektit shtohet automatikisht si Admin i projektit
        // Kjo siguron që ai të ketë leje të plota (fshirje detyrave, fazave, etj.)
        await db.query(
            "INSERT INTO project_members (project_id, user_id, roli_ne_projekt) VALUES (?, ?, ?)", 
            [projectId, userId, 'Admin']
        );

        // 3. SHTESA: Krijojmë automatikisht Sprintin e parë që projekti mos të dalë bosh
        await db.query(
            "INSERT INTO sprints (project_id, emertimi, statusi) VALUES (?, ?, ?)", 
            [projectId, 'Sprint 1: Fillimi i Projektit', 'Active']
        );

        res.status(201).json({ 
            message: "Projekti dhe Sprinti i parë u krijuan me sukses!", 
            id: projectId 
        });
    } catch (error) {
        console.error("Gabim te createProject:", error);
        res.status(500).json({ 
            message: "Gabim gjatë krijimit të projektit", 
            error: error.message || error.code || error.toString() || "Gabim i panjohur"
        });
    }
};

// EKSPORTIMI
module.exports = {
    getAllProjects,
    createProject
};
