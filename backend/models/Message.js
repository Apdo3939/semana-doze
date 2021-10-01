const Sequelize = require('sequelize');

const db = require("./db");

const user = require("./User");
const sala = require("./Sala");

const Message = db.define('messages', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    salaId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Message.belongsTo(user, { foreignKey: 'userId', allowNull: false });
Message.belongsTo(sala, { foreignKey: 'salaId', allowNull: false });

//Message.sync();
//Message.sync({ alter: true });
//Message.sync({ force: true });

module.exports = Message;