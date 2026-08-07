'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Un JWT signé dépasse les 255 caractères par défaut de STRING dès que le
    // payload gagne une revendication (ici jti). MySQL en mode strict rejette
    // alors l'insertion, et la tronque silencieusement sinon.
    await queryInterface.changeColumn('Tokens', 'token', {
      type: Sequelize.STRING(512),
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Tokens', 'token', {
      type: Sequelize.STRING,
    });
  }
};
