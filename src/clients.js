class Clients {
    static obj = {};

    /**
     * Add a client.
     * @param {string} id 
     * @param {object} client 
     */
    static add(id, client) {
        Clients.obj[id] = client;
    }

    /**
     * Delete a client.
     * @param {string} id 
     */
    static delete(id) {
        delete Clients.obj[id];
    }

    /**
     * Get a client.
     * @param {string} id 
     * @returns {object}
     */
    static get(id) {
        return Clients.obj[id];
    }

    /**
     * Get all clients.
     * @returns {object}
     */
    static all() {
        return Clients.obj;
    }
}

module.exports = Clients;