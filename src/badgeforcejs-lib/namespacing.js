const {createHash} = require('crypto');

const GLOBAL_PREFIX = 'credentials:'
const ACADEMIC_PREFIX = `${GLOBAL_PREFIX}academic`;
const ISSUANCE_PREFIX = `${GLOBAL_PREFIX}issuer:issuance`;

const ACADEMIC = createHash('sha512').update(ACADEMIC_PREFIX).digest('hex').substring(0, 6)
const ISSUANCE = createHash('sha512').update(ISSUANCE_PREFIX).digest('hex').substring(0, 6)
const makeAddress = (prefix, postfix) => {
    return prefix.concat(createHash('sha512').update(postfix).digest('hex').toLowerCase().substring(0, 64));
}

const identifierAddress = (prefix, id, postfix) => {
    const idHash = createHash('sha512').update(id).digest('hex').toLowerCase().substring(0, 4);
    const postFixHash = createHash('sha512').update(postfix).digest('hex').toLowerCase().substring(0, 60);
    return prefix.concat(idHash).concat(postFixHash);
}

const partialLeafAddress = (id, nameSpaceAddr) => {
    return nameSpaceAddr.concat(createHash('sha512').update(id).digest('hex').toLowerCase().substring(0, 4));
}

module.exports = {
    ACADEMIC, ISSUANCE, makeAddress, identifierAddress, partialLeafAddress
}