// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const room = rooms[socket.roomId];
        if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
                delete rooms[socket.roomId];
                console.log(`Room ${socket.roomId} deleted`);
            }
        }
    });

    socket.on('join room', (roomId) => {
        socket.roomId = roomId;
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = new Set();
        }
        rooms[roomId].add(socket.id);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('create room', () => {
        const roomId = uuidv4();
        socket.emit('room created', roomId);
    });

    socket.on('code change', (data) => {
        socket.to(socket.roomId).emit('code change', data);
    });

    socket.on('cursor change', (data) => {
        socket.to(socket.roomId).emit('cursor change', data);
    });

});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
