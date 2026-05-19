const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/:projectId', verifyToken, memberController.getProjectMembers);
router.post('/add', verifyToken, memberController.addMemberByEmail);

module.exports = router;
