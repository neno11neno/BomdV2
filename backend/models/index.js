const { Sequelize, DataTypes } = require('sequelize');

// 初始化 Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// 初始化 model
const User = require('./User')(sequelize, DataTypes);
const Note = require('./Note')(sequelize, DataTypes);
const Tag = require('./Tag')(sequelize, DataTypes);

// 設定關聯
User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

// 匯出
module.exports = {
  sequelize,
  Sequelize,
  User,
  Note,
  Tag,
};
