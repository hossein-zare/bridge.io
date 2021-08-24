# Bridge.IO 3.x
Bridge.IO is a realtime websocket framework for NodeJS.

## Features
- Private messaging
- Broadcasting
- Channel support (Pub/Sub)
- Acknowledgement callback (RPC - Request/Response)
- Auto-reconnection
- Disconnection detector
- Built-in ping-pong mechanism
- Authentication

## Installation
```bash
npm i bridge.io
```

## Basic Usage
### Server-Side
```javascript
// Create server
const app = require('express')();
const server = require('http').Server(app);

const BridgeIO = require('bridge.io');
const io = new BridgeIO(app, server, {
    noServer: true
});

io.on('connection', (socket, request) => {
    console.log('A user connected');

    // New message
    socket.on('sum', (io, socket, message, response) => {
        const { a, b } = message;

        // Acknowledgement (RPC - Request/Response)
        return response(a + b);

        // Or
        return response({
            status: 200,
            data: a + b
        });

        // Or
        return response({
            status: 400,
            data: 'Error'
        });
    });

    // Disconnection
    socket.on('disconnected', () => {
        console.log('User disconnected!');
    });
});

// Start the server
server.listen(3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
```

### Client-Side
https://github.com/hossein-zare/bridge.io-client

```html
<script src="/bridge.io/bridge.io.js"></script>
<script>
const socket = new BridgeIO({
    server: 'ws://localhost:3000',
    protocols: [],
    response_timeout: 5000,
    attempts: null,
    delay: 2000,
    reconnection: true
});

socket.on('open', (e, reconnected) => {
    // Connected but not ready
    console.log('Connected');
});

socket.on('connection', (e, reconnected) => {
    console.log('The connection is ready!');

    // Cast a message when connected
    const config = { timeout: 3000 }; // optional
    socket.cast('sum', { a: 1, b: 2 }, function response(result) {

        console.log('Result:', result); // Result: 3, Result: {status: 200, data: 3}

    }, function error(e) {
        if (e === null) {
            // timeout
        } else {
            console.log(e.status, e.data);
        }
    }, config);
});

socket.on('disconnected', (e) => {
    console.log('disconnected');
});

socket.on('reconnecting', (e) => {
    console.log('reconnecting');
});

socket.on('reconnection', (e) => {
    console.log('reconnected');
});

socket.on('message', (data) => {
    console.log(data);
});

socket.on('error', (e) => {
    console.log('error');
});
</script>
```

## Authentication
### Server-Side
```javascript
const url = require('url');

io.auth(async (socket, request) => {
    const token = url.parse(request.url, true).query.token;

    // Authentication (Implement your own authentication function)
    const data = await authentication(token);

    if (data.isAuthenticated) {
        socket.user = data.user;
    }

    return data.isAuthenticated;
});
```

### Client-Side
```javascript
const token = 'myToken';

const socket = new BridgeIO(`ws://localhost:3000/?token=${token}`);
```

## Methods & Properties
### IO
```javascript
// Casting to an specific client
io.to(id: string).cast(event: string, data: string|object|boolean|number);

// Broadcasting to everyone
io.broadcast(event: string, data: string|object|boolean|number);

// Broadcasting to all clients in the specified channels
io.channel(channel: string|array, except: array).cast(event: string, data: string|object|boolean|number);

// Get all clients
io.clients.all();

// Get a client by socket id
io.clients.get(id: string);

// Check if a client exists
io.clients.has(id: string);

// Get all channels
io.channels.all();

// Get a channel by name
io.channels.get(channel: string);

// Check if a channel exists
io.channels.has(channel: string);

// Get subscribers of the channels
io.channels.subscribers(channel: string|array);
```

### Socket
```javascript
// Casting to the client
socket.cast(event: string, data: string|object|boolean|number);

// Casting with acknowledgement (Client-Side)
socket.cast(event: string, data: string|object|boolean|number, callback: () => void);

// Broadcasting to everyone except the sender
socket.broadcast(event: string, data: string|object|boolean|number);

// Broadcasting to all clients in the specified channels except the sender
socket.channel(channel: string|array, except: array).cast(event: string, data: string|object|boolean|number);

// Subscribing to a channel
socket.subscribe(channel: string);

// Unsubscribing from a channel
socket.unsubscribe(channel: string);

// Disconnecting the client
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
socket.close(code: Number, reason: string);

// Client ID
const id = socket.id;

// Client channels
const channels = socket.channels;
```