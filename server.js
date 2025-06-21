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
  console.log("🔌 Bağlandı:", socket.id);

  // ✅ Yeni oyuncu
  socket.on("yeniOyuncu", (isim) => {
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });

    socket.emit("mesaj", `Hoşgeldin ${isim}!`);
    socket.broadcast.emit("mesaj", `${isim} katıldı`);

    if (oyuncular.length >= 2) {
      io.emit("oyunaBasla");
      console.log("🎮 Oyuna Başla gönderildi");
    }
  });

  // ✅ Hazır olan oyuncular
  socket.on("hazir", () => {
    if (!hazirOyuncular.includes(socket.id)) {
      hazirOyuncular.push(socket.id);
    }

    if (hazirOyuncular.length === oyuncular.length) {
      const harfler = ['A','B','C','Ç','D','E','F','G','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
      const secilen = harfler[Math.floor(Math.random() * harfler.length)];
      io.emit("harf", secilen);
      hazirOyuncular = [];
    }
  });

  // ✅ Cevaplar alındı
  socket.on("cevaplar", (veri) => {
    // JSON formatında: { isim: "Oğuzhan", cevaplar: {isim: "Ali", sehir: "Ankara", ...} }
    const { isim, cevaplar } = veri;
    console.log(`📨 Cevap geldi: ${isim}`, cevaplar);

    // Tüm diğer oyunculara gönder
    socket.broadcast.emit("rakipCevap", {
      isim,
      cevaplar
    });
  });

  // ✅ Oyuncu çıkışı
  socket.on("disconnect", () => {
    const oyuncu = oyuncular.find(o => o.id === socket.id);
    if (oyuncu) {
      oyuncular = oyuncular.filter(o => o.id !== socket.id);
      hazirOyuncular = hazirOyuncular.filter(id => id !== socket.id);
      io.emit("mesaj", `${oyuncu.isim} oyundan ayrıldı`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu aktif: http://localhost:${PORT}`);
});
