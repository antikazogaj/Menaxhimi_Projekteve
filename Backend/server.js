// ============================================================================
// SERVER.JS - ZEMRA E BACKEND-IT (ENTRY POINT)
// Për Profesorin: Ky është skedari kryesor që ndez serverin. Këtu konfigurohet 
// gjithçka: libraritë, siguria, lidhja me bazën e të dhënave dhe rrugët (routes).
// ============================================================================

// dotenv lexon variablat nga skedari .env (fjalëkalimet e databazës, portet).
// Pse? Që të mos i shkruajmë fjalëkalimet direkt në kod, për arsye sigurie.
require('dotenv').config();
const express = require('express'); // Express është korniza (framework) bazë që na lejon të krijojmë API-në shumë lehtë.
const mysql = require('mysql2'); // mysql2 është libraria që lidh Node.js me bazën e të dhënave MySQL.
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing) lejon Frontendin (React) të flasë me Backendin.
const path = require('path'); // Ndihmon për të punuar me shtigjet e skedarëve (files) në kompjuter.

const app = express();

// --- MIDDLEWARES (Ndërmjetësit) ---
// Për Profesorin: Middleware janë funksione që ekzekutohen çdo herë që vjen një kërkesë e re në server,
// PARA se kërkesa të shkojë te "Route" specifik (psh. /api/users).

// Aktivizojmë CORS për të mos marrë "Blocked by CORS policy" në shfletues kur React flet me Node.
app.use(cors());

// Lejon serverin të "kuptojë" (parse) të dhënat që i vijnë në formatin JSON nga format e Frontend-it.
app.use(express.json());

// Middleware i personalizuar për LOGS (Gjurmimi i kërkesave)
// Pse? Kjo na ndihmon të shohim çdo veprim që ndodh live në terminal (psh. "GET në /api/tasks") për debugging.
app.use((req, res, next) => {
    console.log(`>>> Kërkesë e re: ${req.method} në ${req.url}`);
    next(); // 'next' i thotë serverit: "Vazhdo me hapin tjetër"
});

// Bëjmë folderin 'uploads' "statik" (të qasshëm nga interneti pa patur nevojë për kod).
// Pse? Që fotot e profilit dhe skedarët të ngarkohen direkt në React nga URL: http://localhost:5001/uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- LIDHJA ME DATABAZËN ---
// Për Profesorin: Krijojmë një lidhje (Connection) me databazën. Ne marrim detajet nga .env,
// që do të thotë që ky kod funksionon njëlloj si në server lokal ashtu edhe kur hidhet live në internet, pa ndryshuar kodin!
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

// --- ROUTES (Rrugët e API-së / Endpoints) ---
// Për Profesorin: Këtu bëhet "Routing". Në vend që ta mbajmë të gjithë kodin në këtë skedar (që do e bënte mijëra rreshta),
// ne e kemi ndarë në module sipas "Separation of Concerns" (Ndarja e Detyrave).
// Çdo rrugë merret nga folderi 'routes'.

app.use('/api/projects', require('./routes/projectRoutes')); // Menaxhon API-në për projektet
app.use('/api/users', require('./routes/userRoutes'));       // Regjistrimi, Login, dhe përdoruesit
app.use('/api/tasks', require('./routes/taskRoutes'));       // Krijimi/Fshirja e detyrave
app.use('/api/members', require('./routes/memberRoutes'));   // Anëtarët brenda një projekti
app.use('/api/labels', require('./routes/labelRoutes'));     // Etiketat (Labels) si Bug, Feature
app.use('/api/comments', require('./routes/commentRoutes')); // Komentet në çdo detyrë
app.use('/api/sprints', require('./routes/sprintRoutes'));   // Fazat (Sprints) për metodologjinë Agile
app.use('/api/activities', require('./routes/activityRoutes')); // Historiku i veprimeve (Kush bëri çfarë)
app.use('/api/attachments', require('./routes/attachmentRoutes')); // Ngarkimi i skedarëve tek detyra
app.use('/api', require('./routes/timeLogRoutes')); // Logimi i kohës së shpenzuar (Orët e punës)
app.use('/api/notifications', require('./routes/notificationRoutes')); // Sistemi Real-time i Njoftimeve
app.use('/uploads', express.static('uploads'));

// Nisim serverin të "dëgjojë" për kërkesa
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(` Serveri po punon në portin ${PORT}`);
});
