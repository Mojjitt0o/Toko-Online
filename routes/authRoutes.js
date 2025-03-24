const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');
const router = express.Router();

// **Registrasi User (Default Role: user)**
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            role: 'user',  // Default sebagai user
            isVerified: false 
        });

        await sendVerificationEmail(newUser.email, newUser.id);
        res.status(201).json({ message: 'Registrasi berhasil! Periksa email untuk verifikasi' });
    } catch (error) {
        console.error("Error terjadi:", error);
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
});

// **Registrasi Admin (Hanya Bisa Dilakukan oleh Admin)**
router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, password, phone, secretKey } = req.body;

        // Cek secret key (contoh: ENV atau hardcoded)
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: 'Kunci rahasia salah' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await User.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            role: 'admin',  // Role admin
            isVerified: true  // Admin langsung diverifikasi
        });

        res.status(201).json({ message: 'Admin berhasil didaftarkan' });
    } catch (error) {
        console.error("Error terjadi:", error);
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    }
});

// **Login User**
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Akun belum diverifikasi' });
        }

        // Generate token dengan role
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login berhasil', token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// **Login Admin**
router.post('/login-admin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ where: { email, role: 'admin' } });

        if (!admin) {
            return res.status(401).json({ message: 'Admin tidak ditemukan atau bukan admin' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Generate token dengan role admin
        const token = jwt.sign(
            { id: admin.id, role: admin.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } // Admin lebih lama
        );

        res.json({ message: 'Login admin berhasil', token });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// **Reset Password Request**
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Email tidak ditemukan' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        await sendResetPasswordEmail(user.email, token);
        res.json({ message: 'Email reset password telah dikirim' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

// **Set New Password**
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Token yang diterima:", token); // Cek apakah token benar

        const { newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id: decoded.id } });

        res.json({ message: 'Password berhasil diubah' });
    } catch (error) {
        console.error("Error verifikasi token:", error); // Log error lebih jelas
        res.status(500).json({ message: 'Token tidak valid atau sudah kadaluarsa', error });
    }
});


// **Verifikasi Email**
router.get('/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Akun sudah terverifikasi' });
        }

        await User.update({ isVerified: true }, { where: { id } });

        res.json({ message: 'Akun berhasil diverifikasi' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', error });
    }
});

module.exports = router;
