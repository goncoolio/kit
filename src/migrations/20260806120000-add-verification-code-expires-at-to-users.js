'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // L'expiration des codes s'appuyait sur updatedAt : toute autre mise à jour
    // du compte prolongeait la validité du code. On la stocke explicitement.
    await queryInterface.addColumn('Users', 'verification_code_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'verification_code_expires_at');
  }
};
