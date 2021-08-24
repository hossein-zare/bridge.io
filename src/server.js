const { WebSocketServer } = require('ws');
const Events = require('events');
const Utils = require('./utils');
const Socket = require('./socket');
const Clients = require('./clients');
const Channel = require('./channel');
const ChannelStorage = require('./channel-storage');

class Server extends Events.EventEmitter {
    constructor(app, http, params) {
        super();

        this.app = app;
        this.http = http;
        this.server = new WebSocketServer(params);
        this.authentication = () => Promise.resolve(true);
        this.events();
        this.upgrade();
        this.ping();
    }

    /**
     * Authenticate.
     * @param {any} callback 
     */
    auth(callback) {
        this.authentication = callback;
    }

    /**
     * Upgrade to WebSocket.
     */
    upgrade() {
        this.app.get('/bridge.io/bridge.io.js', (req, res) => {
            res.type('text/javascript');
            res.sendFile(__dirname + '/client/bridge.io-client.js');
        });

        this.http.on('upgrade', (request, socket, head) => {
            this.server.handleUpgrade(request, socket, head, async (ws) => {
                const isAuthenticated = await this.authentication(ws, request);

                if (isAuthenticated) {
                    Socket.add(ws);
                    Clients.add(ws.id, ws);

                    this.server.emit('connection', ws, request);
                } else {
                    ws.close(4000, "HTTP Authentication failed");

                    return;
                }
            });
        });
    }

    /**
     * Set socket events.
     */
    events() {
        this.server.on('connection', (socket, request) => {
            // A new client connected
            this.emit('connection', socket, request);
            
            socket.on('message', (message) => {
                if (this.isPing(message)) {
                    this.heartBeat(socket);
                } else {
                    try {
                        let obj = Utils.incomingMessage(message);
                        const [event, data, id = undefined] = obj;

                        if (typeof event === 'string') {
                            socket.emit(event, this, socket, data, (data) => {
                                if (id)
                                    socket.cast('rpc', data, id);
                            });
                        }
                    } catch (e) {
                        // 
                    }
                }
            });

            // The client disconnected
            socket.on('close', (e) => {
                socket.emit('disconnected', this, socket, e);

                // Unsubscribe the client from all channels
                socket.channels.forEach(channel => {
                    socket.unsubscribe(channel);
                });

                // Delete the client
                Clients.delete(socket.id);
            });

            // Ready
            socket.send(0xB);
        });

        this.server.on('close', () => {
            clearInterval(this.interval);
        });
    }

    /**
     * Heartbeat.
     * @param {object} socket 
     */
    heartBeat(socket) {
        socket.isAlive = true;
    }

    /**
     * Indicates that the received data is a Ping.
     * @param {any} data 
     * @returns {boolean}
     */
    isPing(data) {
        return Number(data) === 0x9;
    }

    /**
     * Ping the clients.
     */
    ping() {
        if (this.server) {
            this.interval = setInterval(() => {
                this.server.clients.forEach(client => {
                    if (! client.isAlive)
                        return client.terminate();

                    client.isAlive = false;
                    this.pong(client);
                });
            }, 10000);
        }
    }

    /**
     * Send a pong response to the client.
     * @param {object} client 
     */
    pong(client) {
        client.send(0xA);
    }

    /**
     * Cast a message to the client.
     * @param {string} id 
     */
    to(id) {
        return {
            case: (event, data) => {
                try {
                    if (Clients.has(id))
                        Clients.get(id).cast(event, data);
                } catch (e) { }
            }
        };
    }

    /**
     * Broadcast a message.
     * @param {string} event 
     * @param {any} data 
     */
    broadcast(event, data) {
        this.server.clients.forEach(client => {
            client.cast(event, data);
        });
    }

    /**
     * Cast a message to the subscribers of the specified channels.
     * @param {string|array} channels
     * @param {array} except
     * @returns {object}
     */
    channel(channels, except = []) {
        return Channel.channel(channels, except);
    }

    /**
     * Get clients.
     * @returns {object}
     */
    get clients() {
        return Clients;
    }

    /**
     * Get the channel class.
     * @returns {object}
     */
    get channels() {
        return ChannelStorage;
    }
}

module.exports = Server;