const Comment = require('../models/comment');

const getComments = async (req, res) => {
    try {
        const comments = await Comment.getByTask(req.params.taskId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë marrjes së komenteve" });
    }
};

const addComment = async (req, res) => {
    try {
        const { taskId, komenti } = req.body;
        const userId = req.user.id; // Marrim ID nga token-i
        await Comment.create(taskId, userId, komenti);
        res.status(201).json({ message: "Komenti u shtua!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë shtimit të komentit" });
    }
};

module.exports = { getComments, addComment };