const express = require('express');
const { Product } = require('../models');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Tambah Produk (Admin Only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl } = req.body;
        const product = await Product.create({ name, description, price, stock, imageUrl });
        res.status(201).json({ message: 'Produk berhasil ditambahkan', product });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Lihat Semua Produk
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Lihat Detail Produk
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Update Produk (Admin Only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        
        await product.update({ name, description, price, stock, imageUrl });
        res.json({ message: 'Produk berhasil diperbarui', product });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// Hapus Produk (Admin Only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        
        await product.destroy();
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

module.exports = router;
