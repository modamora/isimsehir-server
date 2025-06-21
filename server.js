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
let cevaplar = {}; // { socket.id: { isim: "Miray", cevaplar: { isim: "mehmet", şehir: "manisa", ... } } }

io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  // ✅ Yeni oyuncu geldiğinde
  socket.on("yeniOyuncu", (isim) => {
    console.log("🧑 Yeni Oyuncu:", isim);
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });

    socket.emit("mesaj", `Hoşgeldin ${isim}, keyifli oyunlar!`);
    socket.broadcast.emit("mesaj", `${isim} oyuna katıldı`);

    if (oyuncular.length >= 2) {
      io.emit("oyunaBasla");
      console.log("🟢 Oyuna başla mesajı gönderildi!");
    }
  });

  // ✅ Oyuncu "hazır" dediğinde
  socket.on("hazir", () => {
    if (!hazirOyuncular.includes(socket.id)) {
      hazirOyuncular.push(socket.id);
    }

    console.log(`✅ Hazır Oyuncular: ${hazirOyuncular.length}/${oyuncular.length}`);

    if (hazirOyuncular.length === oyuncular.length && oyuncular.length >= 2) {
      const harfler = ['A','B','C','Ç','D','E','F','G','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
      const secilenHarf = harfler[Math.floor(Math.random() * harfler.length)];
      console.log("📤 Harf gönderildi:", secilenHarf);

      io.emit("harf", secilenHarf);
      hazirOyuncular = [];
      cevaplar = {}; // yeni tur için sıfırla
    }
  });

  // ✅ Oyuncu cevap gönderdiğinde
  socket.on("cevaplar", (data) => {
    const isim = data.isim || "Bilinmeyen";
    const verilenCevaplar = data.cevaplar || {};

    cevaplar[socket.id] = { isim, cevaplar: verilenCevaplar };
    console.log(`📥 ${isim} cevap verdi:`, verilenCevaplar);

    if (Object.keys(cevaplar).length === oyuncular.length) {
      // Tüm oyuncular cevap verdiğinde her birine rakibin cevaplarını gönder
      oyuncular.forEach(({ id }) => {
        const rakip = Object.entries(cevaplar).find(([sid]) => sid !== id);
        if (rakip) {
          const [rakipId, rakipData] = rakip;
          io.to(id).emit("rakipCevap", rakipData);
        }
      });
    }
  });

  // ✅ Oyuncu çıkarsa temizle
  socket.on("disconnect", () => {
    const oyuncu = oyuncular.find(o => o.id === socket.id);
    if (oyuncu) {
      console.log("❌ Oyuncu ayrıldı:", oyuncu.isim);
      oyuncular = oyuncular.filter(o => o.id !== socket.id);
      hazirOyuncular = hazirOyuncular.filter(id => id !== socket.id);
      delete cevaplar[socket.id];
      socket.broadcast.emit("mesaj", `${oyuncu.isim} oyundan ayrıldı`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
