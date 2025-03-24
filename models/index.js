const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Import koneksi database

// Import model
const User = require('./User');
const Product = require('./Product'); // Tambahkan ini
const Cart = require('./Cart'); // Tambahkan jika belum
const Order = require('./Order'); // Tambahkan ini
const OrderItem = require('./OrderItem'); // Tambahkan jika ada


// Sinkronisasi model dengan database
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Product = Product; // Tambahkan ini
db.Cart = Cart; // Tambahkan jika belum
db.Order = Order;
db.OrderItem = OrderItem; // Jika ada model OrderItem


// Pastikan semua model terhubung dengan Sequelize
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
