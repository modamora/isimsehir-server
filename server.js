// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

let rooms = {}; // odaId: [socketId1, socketId2]

io.on('connection', (socket) => {
    console.log('🔌 Yeni bağlantı:', socket.id);

    socket.on('joinRoom', (roomId) => {
        if (!rooms[roomId]) rooms[roomId] = [];

        rooms[roomId].push(socket.id);
        socket.join(roomId);

        console.log(`📥 ${socket.id} katıldı: ${roomId}`);
        io.to(roomId).emit('playerJoined', rooms[roomId]);

        socket.on('disconnect', () => {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            io.to(roomId).emit('playerLeft', rooms[roomId]);
            console.log(`❌ ${socket.id} ayrıldı: ${roomId}`);
        });
    });

    socket.on('gonderCevaplar', ({ roomId, cevaplar }) => {
        console.log(`📨 Cevaplar geldi ${socket.id}:`, cevaplar);
        socket.to(roomId).emit('cevaplarGeldi', { oyuncu: socket.id, cevaplar });
    });
});

server.listen(port, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${port}`);
});
