'use strict';
module.exports = (sequelize, DataTypes) => {
 const users = sequelize.define('users', {
   UserId: {
     allowNull: false,
     autoIncrement: true,
     primaryKey: true,
     type: DataTypes.INTEGER
   },
   FirstName: DataTypes.STRING,
   LastName: DataTypes.STRING,
   Username: {
     type: DataTypes.STRING,
     unique: true
   },
   Deleted: {
     type: DataTypes.BOOLEAN,
     defaultValue: false
   },
   Password: DataTypes.STRING,
   Email: {
     type: DataTypes.STRING,
     unique: true
   },
   Admin: {
     type: DataTypes.BOOLEAN,
     defaultValue: false
   }
 }, {});
 users.associate = function(models) {
   // associations can be defined here
 };
 return users;
};

