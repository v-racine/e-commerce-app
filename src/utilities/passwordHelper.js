const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class PasswordHelper {
  static async HexAndSalt(password) {
    const salt = crypto.randomBytes(8).toString('hex');

    const hashedBuff = await scrypt(password, salt, 64);

    return { hex: hashedBuff.toString('hex'), salt: salt };
  }

  static async ComparePasswords(saved, supplied) {
    //Saved  -> password saved in our db, with structure: '<buff.salt>'
    //Supplied -> password supplied by user trying to sign in
    const [hashed, salt] = saved.split('.');
    const hashedSuppliedBuff = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuff.toString('hex');
  }
}

module.exports = {
  PasswordHelper: PasswordHelper,
};
