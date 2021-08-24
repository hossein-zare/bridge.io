/**
 * Decode incomming message.
 * @param {object} message
 * @return {object}
 */
const incomingMessage = (message) => {
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

    return message;
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
    incomingMessage, outgoingMessage, generateUID, isArray
};