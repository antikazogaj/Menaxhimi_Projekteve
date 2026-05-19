require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // SHTESA: Për rrugët e skedarëve

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logs për të parë çdo kërkesë në terminal
app.use((req, res, next) => {
    console.log(`>>> Kërkesë e re: ${req.method} në ${req.url}`);
    next();
});

// SHTESA: Bëjmë folderin 'uploads' të qasshëm nga interneti
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lidhja me MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Gabim gjatë lidhjes me MySQL:', err.message);
        return;
    }
    console.log(' Sukses: U lidhëm me databazën përmes .env!');
});

// Routes (Rrugët)
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/labels', require('./routes/labelRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/attachments', require('./routes/attachmentRoutes')); 
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Serveri po punon në portin ${PORT}`);
});
