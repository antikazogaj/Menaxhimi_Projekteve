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

module.exports = { getProjectActivity };
