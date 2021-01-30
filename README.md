# Bridge.IO 3.x
Bridge.IO is a realtime websocket framework for NodeJS.

## Features
- Broadcasting
- Private messaging
- Room support
- Acknowledgement callback
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
const BridgeIO = require('./index');

const io = new BridgeIO(app, server, {
    noServer: true
});

io.on('connection', (socket, request) => {
    console.log('A user connected');

    // New message
    socket.on('message', (message, callback) => {
        // Send the message to everyone except the sender
        socket.broadcast('message', message);

        // Acknowledgement
        callback('success');
    });

    // Disconnection
    socket.on('diconnected', () => {
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
```javascript
const BridgeIO = require('bridge.io-client');

// The second argument is optional
const socket = new BridgeIO({
    server: 'ws://localhost:3000',
    protocols: [],
    response_timeout: 5000,
    attempts: null,
    delay: 2000,
    reconnection: true
});

socket.on('open', () => {
    // Connected but not ready
    console.log('Connected');
});

socket.on('connection', (reconnected) => {
    console.log('The connection is ready!');

    // Cast a message when connected
    socket.cast('message', 'hello', function acknowledgement(msg) {
        console.log(msg);
    });
});

socket.on('disconnected', () => {
    console.log('disconnected');
});

socket.on('reconnecting', () => {
    console.log('reconnecting');
});

socket.on('reconnection', () => {
    console.log('reconnected');
});

socket.on('message', (data) => {
    console.log(data);
});

socket.on('error', () => {
    console.log('error');
});
```

## Authentication
### Server-Side
```javascript
const url = require('url');

io.authentication(async (socket, request) => {
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
io.channel(room: string|array).cast(event: string, data: string|object|boolean|number);

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
io.channels.subscribers(room: string|array);
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
socket.channel(channel: string|array).cast(event: string, data: string|object|boolean|number);

// Subscribing to a channel
socket.join(room: string);

// Unsubscribing from a channel
socket.Unsubscribe(room: string);

// Disconnecting the client
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
socket.close(code: Number, reason: string);

// Client ID
const id = socket.id;

// Client channels
const channels = socket.channels;
```