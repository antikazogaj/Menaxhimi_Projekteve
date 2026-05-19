const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/:taskId', verifyToken, commentController.getComments);
router.post('/', verifyToken, commentController.addComment);

module.exports = router;
