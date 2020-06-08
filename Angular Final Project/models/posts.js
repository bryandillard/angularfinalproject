'use strict';
module.exports = (sequelize, DataTypes) => {
 const posts = sequelize.define('posts', {
   PostId: {
     type: DataTypes.INTEGER,
     allowNull: false,
     autoIncrement: true,
     primaryKey: true
   },
   PostTitle: DataTypes.STRING,
   PostBody: DataTypes.STRING,
   UserId: {
     type: DataTypes.INTEGER,
   },
   Deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
 }, {});
 posts.associate = function(models) {
   models.posts.belongsTo(models.users, {
     foreignKey: 'UserId'
   });
 };
 return posts;
};