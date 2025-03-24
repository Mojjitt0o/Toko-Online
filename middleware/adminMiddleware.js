const { User } = require('../models');

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses hanya untuk admin' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
};

module.exports = adminMiddleware;
