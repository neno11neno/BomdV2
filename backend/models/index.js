const { Sequelize, DataTypes } = require('sequelize');

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

const User = require('./User')(sequelize, DataTypes);
const Note = require('./Note')(sequelize, DataTypes);
const Group = require('./Group')(sequelize, DataTypes);

// 設定關聯
User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(User, { foreignKey: 'groupId' });
User.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Note,
  Group,
};