const Sequelize = require("sequelize");

const sequelize = new Sequelize('semanadoze', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log('Banco de dados conectado!');
    })
    .catch(() => {
        console.log('Banco de dados não conectado!');
    });

module.exports = sequelize;