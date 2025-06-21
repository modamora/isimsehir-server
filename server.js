const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // güvenlik istersen burayı sınırlandırabilirsin
    methods: ["GET", "POST"]
  }
});

// Oyuncuları ve hazır olanları tut
let oyuncular = [];
let hazirOyuncular = [];

// Bağlantı geldiğinde
io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  // Yeni oyuncu eklendi
  socket.on("yeniOyuncu", (isim) => {
    console.log("🧑 Yeni oyuncu:", isim);
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });

    // Hoş geldin mesajı
    socket.emit("mesaj", `Hoşgeldin ${isim}, keyifli oyunlar!`);
    socket.broadcast.emit("mesaj", `${isim} oyuna katıldı`);

    // En az 2 kişi varsa oyunu başlat
    if (oyuncular.length >= 2) {
      io.emit("oyunaBasla"); // Ana ekranı "bekle"den "başla"ya çeker
      console.log("🟢 Oyuna başla sinyali gönderildi");
    }
  });

  // Oyuncu hazır olduğunu belirtti
  socket.on("hazir", () => {
    if (!hazirOyuncular.includes(socket.id)) {
      hazirOyuncular.push(socket.id);
    }

    console.log(`✅ Hazır oyuncular: ${hazirOyuncular.length}/${oyuncular.length}`);

    // Tüm oyuncular hazırsa harf gönder
    if (hazirOyuncular.length === oyuncular.length && oyuncular.length > 0) {
      const harfler = ['A','B','C','Ç','D','E','F','G','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
      const secilenHarf = harfler[Math.floor(Math.random() * harfler.length)];
      console.log("📤 Harf gönderildi:", secilenHarf);

      io.emit("harf", secilenHarf);
      hazirOyuncular = []; // Tur için resetle
    }
  });

  // Cevaplar geldi
  socket.on("cevaplar", (cevaplar) => {
    const isim = socket.data.isim || "Bilinmeyen";
    console.log(`📥 ${isim} cevap gönderdi:`, cevaplar);

    // Rakip oyunculara gönder
    socket.broadcast.emit("rakipCevap", {
      isim: isim,
      cevaplar: cevaplar
    });
  });

  // Oyuncu çıkarsa temizle
  socket.on("disconnect", () => {
    const oyuncu = oyuncular.find(o => o.id === socket.id);
    if (oyuncu) {
      console.log("❌ Oyuncu ayrıldı:", oyuncu.isim);
      oyuncular = oyuncular.filter(o => o.id !== socket.id);
      hazirOyuncular = hazirOyuncular.filter(id => id !== socket.id);
      socket.broadcast.emit("mesaj", `${oyuncu.isim} oyundan ayrıldı`);
    }
  });
});

// ✅ Render'ın istediği PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
