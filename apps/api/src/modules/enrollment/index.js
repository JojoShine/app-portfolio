'use strict';

module.exports = {
  routes: require('./routes'),
  seedCrypto: { encrypt: require('./utils/crypto').encrypt, digest: require('./utils/crypto').digest },
};
