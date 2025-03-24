const express = require('express');
const { Cart, Product } = require('../models');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Tambah Produk ke Keranjang
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        console.log("Data yang diterima:", { productId, quantity, userId });

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        let cartItem = await Cart.findOne({ where: { user_id: userId, product_id: productId } });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({ user_id: userId, product_id: productId, quantity });
        }

        res.status(201).json({ message: 'Produk ditambahkan ke keranjang', cartItem });
    } catch (error) {
        console.error("Error tambah produk ke keranjang:", error);
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
});


// Lihat Keranjang Pengguna
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("Mencari keranjang untuk userId:", userId);

        const cartItems = await Cart.findAll({ 
            where: { user_id: userId }, // Perbaiki dari userId ke user_id
            include: [{ model: Product }]
        });
        

        console.log("Data keranjang:", cartItems);

        res.json(cartItems);
    } catch (error) {
        console.error("Error saat mengambil keranjang:", error);
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});



// Update Jumlah Produk di Keranjang
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { quantity } = req.body;
        const userId = req.user.id;
        
        const cartItem = await Cart.findOne({ where: { id: req.params.id, userId } });
        if (!cartItem) return res.status(404).json({ message: 'Item tidak ditemukan di keranjang' });
        
        cartItem.quantity = quantity;
        await cartItem.save();
        res.json({ message: 'Jumlah produk diperbarui', cartItem });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Hapus Produk dari Keranjang
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItem = await Cart.findOne({ where: { id: req.params.id, userId } });
        if (!cartItem) return res.status(404).json({ message: 'Item tidak ditemukan di keranjang' });
        
        await cartItem.destroy();
        res.json({ message: 'Produk dihapus dari keranjang' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

module.exports = router;
