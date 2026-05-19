const deleteLabel = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM labels WHERE id = ?", [id]);
        res.status(200).json({ message: "Etiketa u fshi!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim! Etiketa mund të jetë në përdorim." });
    }
};

module.exports = { ... deleteLabel };