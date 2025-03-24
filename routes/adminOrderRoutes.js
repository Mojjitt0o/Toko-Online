const express = require('express');
const { Order, OrderItem, User } = require('../models');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');

// Lihat Semua Transaksi (Admin)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({ include: [OrderItem, User] });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Ubah Status Pesanan
router.put('/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await Order.findByPk(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        await order.save();
        
        res.json({ message: 'Status pesanan diperbarui', order });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Hapus Pesanan
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        
        await order.destroy();
        res.json({ message: 'Pesanan dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

module.exports = router;
