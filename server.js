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

let oyuncular = [];
let hazirOyuncular = [];

io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  // ✅ Yeni oyuncu geldiğinde
  socket.on("yeniOyuncu", (isim) => {
    console.log("🧑 Yeni Oyuncu:", isim);
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });

    socket.emit("mesaj", `Hoşgeldin ${isim}, keyifli oyunlar!`);
    socket.broadcast.emit("mesaj", `${isim} oyuna katıldı`);

    // Eğer 2 veya daha fazla oyuncu varsa başlat sinyali gönder
    if (oyuncular.length >= 2) {
      io.emit("oyunaBasla"); // << BUNU EKLEDİK
      console.log("🟢 Oyuna başla mesajı gönderildi!");
    }
  });

  // ✅ Oyuncular hazır dediğinde
  socket.on("hazir", () => {
    if (!hazirOyuncular.includes(socket.id)) {
      hazirOyuncular.push(socket.id);
    }

    console.log(`✅ Hazır Oyuncular: ${hazirOyuncular.length}/${oyuncular.length}`);

    if (hazirOyuncular.length === oyuncular.length && oyuncular.length > 0) {
      const harfler = ['A','B','C','Ç','D','E','F','G','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
      const secilenHarf = harfler[Math.floor(Math.random() * harfler.length)];
      console.log("📤 Harf gönderildi:", secilenHarf);

      io.emit("harf", secilenHarf);
      hazirOyuncular = []; // yeni tur için sıfırla
    }
  });

  // ✅ Oyuncular cevap gönderdiğinde
  socket.on("cevaplar", (cevaplar) => {
    console.log(`📥 ${socket.data.isim}'dan cevaplar geldi:`, cevaplar);
    socket.broadcast.emit("rakipCevap", cevaplar);
  });

  // ✅ Oyuncu çıkarsa temizle
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
