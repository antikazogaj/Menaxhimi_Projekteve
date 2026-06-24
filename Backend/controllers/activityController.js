const Activity = require('../models/activity');

const getProjectActivity = async (req, res) => {
    try {
        const { projectId } = req.params;
        const activities = await Activity.getByProject(projectId);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë marrjes së aktiviteteve" });
    }
};

const getUserActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const activities = await Activity.getUserActivities(userId);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë marrjes së historikut", error: error.message });
    }
};

module.exports = { getProjectActivity, getUserActivities };
