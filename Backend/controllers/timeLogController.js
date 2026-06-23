const TimeLog = require('../models/timeLog');
const Task = require('../models/task');

exports.getTimeLogsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const timeLogs = await TimeLog.getByTask(taskId);
        res.json(timeLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.createTimeLog = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { durationMinutes } = req.body;
        const userId = req.user.id;

        if (!durationMinutes || isNaN(durationMinutes) || durationMinutes <= 0) {
            return res.status(400).json({ error: "Kohëzgjatja e pavlefshme" });
        }

        const logId = await TimeLog.create(taskId, userId, durationMinutes);
        res.status(201).json({ id: logId, taskId, userId, durationMinutes, message: "Koha u regjistrua me sukses" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.deleteTimeLog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const timeLog = await TimeLog.getById(id);
        if (!timeLog) {
            return res.status(404).json({ error: "Log-u nuk u gjet" });
        }

        // Only the owner or an admin can delete
        if (timeLog.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: "Nuk keni të drejta për të fshirë këtë log" });
        }

        await TimeLog.delete(id);
        res.json({ message: "Koha u fshi me sukses" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await TimeLog.getStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};
