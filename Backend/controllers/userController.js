const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Fjalëkalimi i gabuar!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            token,
            role: user.role, 
            name: user.name 
        });

    } catch (error) {
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Ky email ekziston!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Default roli 'user' me të vogla që të përputhet me kontrollin në frontend
        await User.create({ name, email, password: hashedPassword, role: 'user' });
        res.status(201).json({ message: "U regjistruat me sukses!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim!", error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Gabim!" });
    }
};



const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // Roli i ri vjen nga React (admin ose user)
        
        await User.updateRole(id, role); // Sigurohu që User.updateRole ekziston në model
        res.status(200).json({ message: "Roli u ndryshua!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gabim gjatë ndryshimit të rolit" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id); // Sigurohu që User.delete ekziston në model
        res.status(200).json({ message: "Përdoruesi u fshi!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
};

module.exports = { login, register, getUsers, updateRole, deleteUser };
