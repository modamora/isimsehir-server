const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = [];

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı:", socket.id);

  socket.on("joinRoom", (playerName) => {
    users.push({ id: socket.id, name: playerName });
    console.log(`${playerName} odaya katıldı.`);
    io.emit("roomUsers", users.map(u => u.name));
  });

  socket.on("disconnect", () => {
    const disconnectedUser = users.find(u => u.id === socket.id);
    if (disconnectedUser) {
      console.log(`${disconnectedUser.name} bağlantıyı kesti.`);
    }
    users = users.filter(u => u.id !== socket.id);
    io.emit("roomUsers", users.map(u => u.name));
  });
});

app.get("/", (req, res) => {
  res.send("İsim Şehir Socket Sunucusu Çalışıyor ✅");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Sunucu ${PORT} portunda çalışıyor.`);
});
