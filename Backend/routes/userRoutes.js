const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware'); // Middleware që mbron rrugët

// --- RRUGËT PËR PËRDORUESIT (USERS API) ---

// 1. Rruga për regjistrim (Nuk kërkon Token sepse përdoruesi s'ka akoma llogari)
// POST http://localhost:5001/api/users/register
router.post('/register', userController.register);

// 2. Rruga për login (Kthen Token-in)
// POST http://localhost:5001/api/users/login
router.post('/login', userController.login);

// 3. Rruga për marrjen e të gjithë përdoruesve (Admin Panel)
// Kërkon 'verifyToken' para se të lejojë ekzekutimin e 'getUsers'
// GET http://localhost:5001/api/users/
router.get('/', verifyToken, userController.getUsers);

// 4. Rruga për ndryshimin e rolit (Përdor ID-në e përdoruesit në URL p.sh. /api/users/5/role)
// PUT http://localhost:5001/api/users/:id/role
router.put('/:id/role', verifyToken, userController.updateRole);

// 5. Rruga për fshirjen e përdoruesit
// DELETE http://localhost:5001/api/users/:id
router.delete('/:id', verifyToken, userController.deleteUser);

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Sigurohu që ky folder ekziston në backend
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 6. Rruga për ngarkimin e avatarit
router.post('/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
