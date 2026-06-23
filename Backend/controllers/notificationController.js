const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.getByUser(userId);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.getUnreadByUser(userId);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.markAsRead(id);
        res.json({ message: "Njoftimi u lexua" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.markAllAsRead(userId);
        res.json({ message: "Të gjitha njoftimet u lexuan" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gabim në server" });
    }
};
