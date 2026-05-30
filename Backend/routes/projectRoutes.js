const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// 1. Importojmë mbrojtjen (Rojen) për të siguruar që përdoruesi është i kyçur
const verifyToken = require('../middleware/authMiddleware');

// --- RRUGËT PËR PROJEKTET (PROJECTS API) ---

// 2. Rrugët për marrjen dhe shtimin e projekteve
// 'verifyToken' siguron që vetëm përdoruesit e kyçur (që kanë një Token valid) mund t'i shohin ose shtojnë projektet.
// GET http://localhost:5001/api/projects/
router.get('/', verifyToken, projectController.getAllProjects);

// POST http://localhost:5001/api/projects/
router.post('/', verifyToken, projectController.createProject);

module.exports = router;
