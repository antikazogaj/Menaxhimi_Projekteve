const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// 1. Rruga për regjistrim
router.post('/register', userController.register);

// 2. Rruga për login
router.post('/login', userController.login);

// 3. Rruga për marrjen e të gjithë përdoruesve (Admin Panel)
router.get('/', verifyToken, userController.getUsers);

// 4. Rruga për ndryshimin e rolit (Përdor ID-në e përdoruesit)
// URL: http://localhost:5000/api/users/:id/role
router.put('/:id/role', verifyToken, userController.updateRole);

// 5. Rruga për fshirjen e përdoruesit
// URL: http://localhost:5000/api/users/:id
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
