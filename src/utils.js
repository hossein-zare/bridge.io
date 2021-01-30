/**
 * Convert base64 to string.
 * @param {string} message
 * @returns {string} 
 */
const toString = (message) => {
    return Buffer.from(message, 'base64').toString('binary');
};

/**
 * Convert string to base64.
 * @param {string} message 
 * @returns {string}
 */
const toBase64 = (message) => {
    return Buffer.from(message).toString('base64');
};

/**
 * Decode incomming message.
 * @param {object} message
 * @return {object}
 */
const incomingMessage = (message) => {
    message = String.fromCharCode.apply(null, message);
    message = toString(message);
    message = JSON.parse(message);

    return message;
}

/**
 * Encode outgoing message.
 * @param {object} str
 * @returns {object}
 */
const outgoingMessage = (message) => {
    message = JSON.stringify(message);
    message = toBase64(message);
    message = str2ab(message);

    return message;
}


/**
 * Convert string to ArrayBuffer.
 * @param {string} str
 * @returns {object}
 */
const str2ab = (str) => {
    const len = str.length;
    const buf = new ArrayBuffer(len * 2);
    let bufView = new Uint16Array(buf);

    for (let i = 0; i < len; i++)
        bufView[i] = str.charCodeAt(i);

    return buf;
}

/**
 * Generate a unique id.
 * @returns {string}
 */
const generateUID = () => {
    return Math.random().toString(36).substr(2, 15);
}

/**
 * Check if the object is an array.
 * @param {object} obj
 * @returns {boolean}
 */
const isArray = obj => {
    return Object.prototype.toString.call(obj) === "[object Array]";
}

module.exports = {
    toString, toBase64, incomingMessage, outgoingMessage, generateUID, isArray
};