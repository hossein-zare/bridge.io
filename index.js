const WebSocket = require('ws');
const Rooms = require('./src/rooms');
const Clients = require('./src/clients');
const Caster = require('./src/caster');
const Crypto = require('./src/crypto');

class BridgeIO {
    constructor(httpServer, ...args) {
        this.httpServer = httpServer;
        this.server = new WebSocket.Server(...args);
        this.events = {
            connection: () => {},
            authentication: null
        };

        this.upgrade();
        this.defaultEvents();
    }

    /**
     * Generate unique id.
     * @returns {string}
     */
    generateUID() {
        return Math.random().toString(36).substr(2, 15);
    }

    /**
     * Default events.
     */
    defaultEvents() {
        this.server.on('connection', (ws, ...args) => {
            // Message
            ws.on('message', (message) => {
                if (message === '10') {
                    // Pong
                    ws.isAlive = true;
                } else {
                    try {
                        const decrypted = Crypto.decrypt(message);
    
                        const json = JSON.parse(decrypted);
                        const {
                            event = null,
                            data = null,
                            ack = null
                        } = json;
    
                        if (event in ws.events) {
                            let acknowledgment;
    
                            if (ack) {
                                acknowledgment = (...args) => {
                                    ws.cast('ack', {
                                        args,
                                        ack
                                    });
                                };
                            }
    
                            ws.events[event](data, ack && acknowledgment);
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });

            // Close
            ws.on('close', (e) => {
                if (ws.events.hasOwnProperty('close'))
                    ws.events.close(e);

                // Delete client from all rooms
                ws.rooms.slice().forEach(room => {
                    ws.leave(room);
                });

                // Delete client
                delete Clients.delete(ws.id);
            });

            // Ready
            this.events.connection(ws, ...args);
            ws.cast('ready');
        });

        const pongInterval = setInterval(() => {
            if (this.server) {
                this.server.clients.forEach((ws) => {
                    if (ws.isAlive === false)
                        return ws.terminate();
            
                    ws.isAlive = false;
                    ws.send(9);
                });
            }
        }, 30000);

        this.server.on('close', () => {
            clearInterval(pongInterval);
        });
    }

    /**
     * Watch events.
     * @param {string} event 
     * @param {any} callback 
     */
    watch(event, callback) {
        this.events[event] = callback;
    }

    /**
     * Authentication method.
     */
    authentication(callback) {
        this.events.authentication = callback;
    }

    /**
     * Upgrade the request.
     */
    upgrade() {
        const instance = this;
        this.httpServer.on('upgrade', (request, socket, head) => {
            this.server.handleUpgrade(request, socket, head, async (ws) => {
                ws.authenticated = true;
                if (this.events.authentication !== null) {
                    ws.authenticated = await this.events.authentication(instance, ws, request, socket);
                }

                // Check if the connection is authenticated
                if (! ws.authenticated) {
                    ws.close(4000, "HTTP Authentication failed");
                    return;
                }

                ws.cast = Caster.cast;
                ws.broadcast = Caster.broadcast;
                ws.rooms = [];
                ws.join = Rooms.join;
                ws.leave = Rooms.leave;
                ws.room = Rooms.room;
                ws.events = {};
                ws.watch = this.watch;
    
                // Ping Pong
                ws.isAlive = true;

                // Generate Socket ID
                if (! ('id' in ws)) {
                    ws.id = this.generateUID();
                }

                // Add client
                Clients.add(ws.id, ws);
    
                this.server.emit('connection', ws, request);
            });
        });
    }

    /**
     * Send a private message.
     * @param {string} id 
     * @returns {object}
     */
    to(id) {
        if (id in Clients.all())
            return Clients.get(id);

        return {
            cast: () => {}
        };
    }

    /**
     * Broadcast.
     * @param {string} event 
     * @param {any} data 
     */
    broadcast(event, data) {
        for (const clientId in Clients.all()) {
            Clients.get(clientId).cast(event, data);
        }
    }

    /**
     * Cast to an specific room members.
     * @param {string|array} rooms 
     * @returns {object}
     */
    room(rooms) {
        const members = Rooms.members(rooms);

        return {
            cast: (event, data) => Caster.multicast(event, data, members)
        };
    }

    /**
     * Get clients.
     * @returns {object}
     */
    get clients() {
        return Clients;
    }
}

module.exports = (httpServer, opt) => {
    return new BridgeIO(httpServer, opt);
};