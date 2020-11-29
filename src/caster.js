const Clients = require('./clients');
const Crypto = require('./crypto');

class Caster {
    /**
     * Cast a message.
     * @param {string} event 
     * @param {any} data 
     */
    static cast(event, data) {
        const message = {
            event,
            data
        };
        const json = JSON.stringify(message);
        const encrypted = Crypto.encrypt(json);
        
        this.send(encrypted);
    }

    /**
     * Multicast.
     * @param {string} event 
     * @param {any} data 
     * @param {array} members 
     * @param {array} exception 
     */
    static multicast(event, data, members, exception = []) {
        members.forEach(id => {
            if (! exception.includes(id))
                Clients.get(id).cast(event, data);
        });
    }

    /**
     * Broadcast.
     * @param {string} event 
     * @param {any} data 
     */
    static broadcast(event, data) {
        for (const clientId in Clients.all()) {
            if (clientId !== this.id)
                Clients.get(clientId).cast(event, data);
        }
    }
}

module.exports = Caster;