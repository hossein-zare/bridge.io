/**
 * Decode incomming message.
 * @param {string} message
 * @return {object}
 */
const incomingMessage = (message) => {
    return JSON.parse(message);
};

/**
 * Encode outgoing message.
 * @param {object} str
 * @returns {string}
 */
const outgoingMessage = (message) => {
    return JSON.stringify(message);
};

/**
 * Generate a unique id.
 * @returns {string}
 */
const generateUID = () => {
    return Math.random().toString(36).substr(2, 15);
};

module.exports = {
    incomingMessage, outgoingMessage, generateUID
};