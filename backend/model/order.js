const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Order', {
        cart: {
            type: DataTypes.JSON,
            allowNull: false
        },
        shipping_address: {
            type: DataTypes.JSON,
            allowNull: false
        },
        user: {
            type: DataTypes.JSON,
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'Processing'
        },
        payment_info: {
            type: DataTypes.JSON
        },
        paid_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        delivered_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'orders',
        timestamps: false
    });
};
