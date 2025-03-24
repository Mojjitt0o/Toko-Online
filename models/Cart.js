// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const User = require('./User');
// const Product = require('./Product');

// const Cart = sequelize.define('Cart', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: User,
//             key: 'id'
//         }
//     },
//     product_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: Product,
//             key: 'id'
//         }
//     },
//     quantity: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 1
//     }
// });

// module.exports = Cart;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {  // Perbaiki menjadi user_id
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Cart;
