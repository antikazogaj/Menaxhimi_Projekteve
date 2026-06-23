// dotenv përdoret për të lexuar variablat e mjedisit nga skedari .env (si fjalëkalimet e databazës)
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Lejon kërkesat nga adresa të tjera (p.sh. nga React në portin 3000 te Backend në 5001)
const path = require('path'); 

const app = express();

// --- MIDDLEWARES (Ndërmjetësit) ---
// Aktivizojmë CORS për të lejuar komunikimin Frontend-Backend
app.use(cors());
// Lejon serverin të kuptojë të dhënat që vijnë në formatin JSON
app.use(express.json());

// Logs për të parë çdo kërkesë në terminal
app.use((req, res, next) => {
    console.log(`>>> Kërkesë e re: ${req.method} në ${req.url}`);
    next();
});

// SHTESA: Bëjmë folderin 'uploads' të qasshëm nga interneti (këtu ruhen skedarët e bashkëngjitur)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- LIDHJA ME DATABAZËN ---
// Krijojmë lidhjen me MySQL duke përdorur të dhënat nga skedari .env për siguri
const db = mysql.createConnection({
    host: process.env.DB_HOST,         // p.sh. localhost
    user: process.env.DB_USER,         // p.sh. root
    password: process.env.DB_PASS,     // fjalëkalimi
    database: process.env.DB_NAME      // emri i databazës (taskmanagerdb)
});

db.connect((err) => {
    if (err) {
        console.error('Gabim gjatë lidhjes me MySQL:', err.message);
        return;
    }
    console.log(' Sukses: U lidhëm me databazën përmes .env!');
});

// --- ROUTES (Rrugët e API-së) ---
// Këtu përcaktojmë se cilët kontrollera do të përdoren për rrugë të ndryshme
app.use('/api/projects', require('./routes/projectRoutes')); // Menaxhon projektet
app.use('/api/users', require('./routes/userRoutes'));       // Menaxhon përdoruesit (login/register)
app.use('/api/tasks', require('./routes/taskRoutes'));       // Menaxhon detyrat (Gantt, statuset)
app.use('/api/members', require('./routes/memberRoutes'));   // Menaxhon anëtarët e projektit
app.use('/api/labels', require('./routes/labelRoutes'));     // Menaxhon etiketat
app.use('/api/comments', require('./routes/commentRoutes')); // Menaxhon komentet në detyra
app.use('/api/sprints', require('./routes/sprintRoutes'));   // Menaxhon fazat (Burndown chart)
app.use('/api/activities', require('./routes/activityRoutes')); // Menaxhon historikun e aktiviteteve
app.use('/api/attachments', require('./routes/attachmentRoutes')); // Menaxhon ngarkimin e file-ve
app.use('/api', require('./routes/timeLogRoutes')); // Menaxhon regjistrimin e kohës
app.use('/api/notifications', require('./routes/notificationRoutes')); // Menaxhon njoftimet
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(` Serveri po punon në portin ${PORT}`);
});
