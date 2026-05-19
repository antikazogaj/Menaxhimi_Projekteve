const express = require('express');
const router = express.Router();
const Label = require('../models/label');
const verifyToken = require('../middleware/authMiddleware');

// Merr të gjitha etiketat
router.get('/', verifyToken, async (req, res) => {
    try {
        const labels = await Label.getAll();
        res.status(200).json(labels);
    } catch (err) {
        res.status(500).json({ message: "Gabim gjatë marrjes së etiketave" });
    }
});

// Shto etiketë të re
router.post('/', verifyToken, async (req, res) => {
    try {
        const { emertimi, ngjyra } = req.body;
        const id = await Label.create(emertimi, ngjyra);
        res.status(201).json({ id, emertimi, ngjyra });
    } catch (err) {
        res.status(500).json({ message: "Gabim gjatë krijimit të etiketës" });
    }
});


module.exports = router;
