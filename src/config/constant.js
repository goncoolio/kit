// Les statuts doivent correspondre à l'ENUM de la table Users
// ENUM('active', 'inactive', 'deleted', 'blocked')
const userConstant = {
    EMAIL_VERIFIED_TRUE: 1,
    EMAIL_VERIFIED_FALSE: null,
    STATUS_ACTIVE: 'active',
    STATUS_INACTIVE: 'inactive',
    STATUS_REMOVED: 'deleted',
    STATUS_BLOCKED: 'blocked',
};
const verificationCodeConstant = {
    TYPE_EMAIL_VERIFICATION: 1,
    TYPE_RESET_PASSWORD: 2,
    STATUS_NOT_USED: 0,
    STATUS_USED: 1,
};

module.exports = {
    userConstant,
    verificationCodeConstant,
};
