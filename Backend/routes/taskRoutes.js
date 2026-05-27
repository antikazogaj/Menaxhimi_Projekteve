const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middleware/authMiddleware');

// 1. Merr detyrat për një projekt specifik (GET)
// URL: http://localhost:5001/api/tasks/1

router.get('/:id', verifyToken, taskController.getProjectTasks);
router.get('/all/user', verifyToken, taskController.getTaskStats);

// 2. Shto detyrë të re (POST)
// URL: http://localhost:5001/api/tasks/
router.post('/', verifyToken, taskController.createTask);

// 3. Përditëso statusin e detyrës (PUT)
// URL: http://localhost:5001/api/tasks/ID_E_DETYRES
router.put('/:id', verifyToken, taskController.updateTaskStatus);

// 3b. Përditëso etiketën e detyrës (PUT)
router.put('/:id/label', verifyToken, taskController.updateTaskLabel);

// 4. Fshi një detyrë (DELETE)
// URL: http://localhost:5001/api/tasks/ID_E_DETYRES
router.delete('/:id', verifyToken, taskController.deleteTask);

module.exports = router;
