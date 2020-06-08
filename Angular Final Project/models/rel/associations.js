module.exports = function(models) {
    models.posts.belongsTo(models.users, {
        foreignKey: 'UserId'
    });
 }