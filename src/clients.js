class Clients {
    static storage = new Map();

    /**
     * Add a client.
     * @param {string} id 
     * @param {object} client 
     */
    static add(id, client) {
        return Clients.storage.set(id, client);
    }

    /**
     * Delete a client.
     * @param {string} id 
     */
    static delete(id) {
        return Clients.storage.delete(id);
    }

    /**
     * Get a client.
     * @param {string} id 
     * @returns {object}
     */
    static get(id) {
        return Clients.storage.get(id);
    }

    /**
     * Check if the client exists.
     * @param {string} id
     * @returns {object}
     */
    static has(id) {
        return Clients.storage.has(id);
    }

    /**
     * Get all clients.
     * @returns {object}
     */
    static all() {
        return Clients.storage;
    }
}

module.exports = Clients;