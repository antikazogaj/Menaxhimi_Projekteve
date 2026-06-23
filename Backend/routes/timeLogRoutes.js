const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timeLogController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/tasks/:taskId/time-logs', verifyToken, timeLogController.getTimeLogsByTask);
router.post('/tasks/:taskId/time-logs', verifyToken, timeLogController.createTimeLog);
router.delete('/time-logs/:id', verifyToken, timeLogController.deleteTimeLog);
router.get('/time-logs-stats', verifyToken, timeLogController.getStats);

module.exports = router;
