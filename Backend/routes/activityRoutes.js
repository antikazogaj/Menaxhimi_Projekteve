const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/user', verifyToken, activityController.getUserActivities);
router.get('/:projectId', verifyToken, activityController.getProjectActivity);

module.exports = router;
