const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Format: Bearer <token>
        if (!token) return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ message: 'Token tidak valid' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }
};

module.exports = authMiddleware;
