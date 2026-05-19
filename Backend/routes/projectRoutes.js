const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// 1. Importojmë mbrojtjen (Rojen)
const verifyToken = require('../middleware/authMiddleware');

// 2. Rrugët për marrjen dhe shtimin e projekteve
// Kjo siguron që vetëm përdoruesit e kyçur (me Token) mund t'i shohin ose shtojnë projektet.
router.get('/', verifyToken, projectController.getAllProjects);
router.post('/', verifyToken, projectController.createProject);

module.exports = router;
