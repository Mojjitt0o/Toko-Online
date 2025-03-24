const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log // Tambahkan log untuk debugging
    }
);

sequelize.authenticate()
    .then(() => console.log('Database Connected!'))
    .catch(err => console.error('Database Connection Error:', err));

module.exports = sequelize;
