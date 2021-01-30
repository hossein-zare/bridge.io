const CryptoJS = require('crypto-js');

class Crypto {
    static key = '!@#v/$&@$^#$%!WREs1grHWGeAS5DS';

    /**
     * Encrypt the data.
     * @param {string} data
     * @returns {string} 
     */
    static encrypt(data) {
        return CryptoJS.AES.encrypt(data, Crypto.key).toString();
    }

    /**
     * Decrypt the data.
     * @param {string} data
     * @returns {string} 
     */
    static decrypt(data) {
        const bytes = CryptoJS.AES.decrypt(data, Crypto.key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

module.exports = Crypto;