const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Kirim Email Verifikasi
const sendVerificationEmail = async (email, userId) => {
    const verificationLink = `http://localhost:5000/api/users/verify/${userId}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verifikasi Akun Anda',
        text: `Klik link berikut untuk verifikasi akun Anda: ${verificationLink}`
    };
    await transporter.sendMail(mailOptions);
};

// Kirim Email Reset Password
const sendResetPasswordEmail = async (email, token) => {
    const resetLink = `http://localhost:5000/reset-password/${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        text: `Klik link berikut untuk mereset password Anda: ${resetLink}`
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
