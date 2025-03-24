const express = require('express');
const { Order, OrderItem, Cart, Product } = require('../models');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Checkout dan Buat Pesanan
// Endpoint checkout order
router.post('/checkout', async (req, res) => {
    try {
        const { userId, address, shippingMethod, paymentMethod, totalAmount } = req.body;

        // Pastikan `address` tidak kosong
        if (!address) {
            return res.status(400).json({ message: "Alamat pengiriman wajib diisi" });
        }

        const order = await Order.create({
            user_id: userId,
            shipping_address: address,  // <- Ubah ini agar cocok dengan nama kolom di database
            total_price: totalAmount,
            status: 'pending'
        });

        res.status(201).json({ message: "Order berhasil dibuat", order });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
});


// Lihat Pesanan Pengguna
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({ where: { userId }, include: OrderItem });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Lihat Detail Pesanan
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: OrderItem });
        if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

module.exports = router;
