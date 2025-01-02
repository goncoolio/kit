'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    uuid: DataTypes.UUID,
    nom: DataTypes.STRING,
    prenoms: DataTypes.STRING,
    tel: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'inactive', 'deleted', 'blocked'),
    email_verified_at: DataTypes.DATE,
    tel_verified_at: DataTypes.DATE,
    verification_code: DataTypes.STRING,
    address: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'user'), 
      defaultValue: 'user'
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};