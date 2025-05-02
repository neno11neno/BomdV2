module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    image: {
      type: DataTypes.STRING,
    },
    isPrivate: { // 新增 isPrivate 屬性
      type: DataTypes.BOOLEAN,
      defaultValue: false, // 預設為公開
    },
  });

  return Note;
};