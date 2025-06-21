// ✅ server.js dosyası (Render veya lokal sunucu icin hazır)

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
let cevaplarListesi = {}; // Cevaplar socket.id bazlı tutulur

io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  socket.on("yeniOyuncu", (isim) => {
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });
    console.log("🧑 Yeni Oyuncu:", isim);

    socket.emit("mesaj", `Hoşgeldin ${isim}, keyifli oyunlar!`);
    socket.broadcast.emit("mesaj", `${isim} oyuna katıldı`);

    // ✔️ 2 oyuncu varsa oyuna başla sinyali gönder
    if (oyuncular.length >= 2) {
      io.emit("oyunaBasla");
      console.log("🟢 Oyuna başla mesajı gönderildi!");
    }
  });

  socket.on("hazir", () => {
    if (!hazirOyuncular.includes(socket.id)) {
      hazirOyuncular.push(socket.id);
    }

    console.log(`✅ Hazır Oyuncular: ${hazirOyuncular.length}/${oyuncular.length}`);

    if (hazirOyuncular.length === oyuncular.length && oyuncular.length > 0) {
      const harfler = [..."ABCÇDEFGHIİJKLMNOÖPRSŞuÜVYZ"];
      const secilenHarf = harfler[Math.floor(Math.random() * harfler.length)];
      io.emit("harf", secilenHarf);
      hazirOyuncular = [];
    }
  });

  socket.on("cevaplar", (veri) => {
    // veri = {isim: "Miray", cevaplar: {...}}
    cevaplarListesi[socket.id] = {
      isim: veri.isim,
      cevaplar: veri.cevaplar
    };

    // ✔️ İki oyuncudan da cevap geldiyse karşılaştır ve puanla
    if (Object.keys(cevaplarListesi).length === 2) {
      const ids = Object.keys(cevaplarListesi);
      const [id1, id2] = ids;
      const oyuncu1 = cevaplarListesi[id1];
      const oyuncu2 = cevaplarListesi[id2];

      const kategoriler = ["isim", "şehir", "hayvan", "bitki", "eşya"];
      const puanlar1 = {};
      const puanlar2 = {};

      kategoriler.forEach((kat) => {
        const c1 = (oyuncu1.cevaplar[kat] || "").toLowerCase().trim();
        const c2 = (oyuncu2.cevaplar[kat] || "").toLowerCase().trim();
        const ayni = c1 === c2 && c1 !== "";

        puanlar1[kat] = c1 === "" ? 0 : ayni ? 5 : 10;
        puanlar2[kat] = c2 === "" ? 0 : ayni ? 5 : 10;
      });

      // ✔️ Oyuncu 1'e veri gönder
      io.to(id1).emit("puanSonucu", {
        benim: oyuncu1.cevaplar,
        rakip: { isim: oyuncu2.isim, cevaplar: oyuncu2.cevaplar },
        puanlar: puanlar1
      });

      // ✔️ Oyuncu 2'ye veri gönder
      io.to(id2).emit("puanSonucu", {
        benim: oyuncu2.cevaplar,
        rakip: { isim: oyuncu1.isim, cevaplar: oyuncu1.cevaplar },
        puanlar: puanlar2
      });

      // temizle
      cevaplarListesi = {};
    }
  });

  socket.on("disconnect", () => {
    const oyuncu = oyuncular.find(o => o.id === socket.id);
    if (oyuncu) {
      console.log("❌ Oyuncu ayrıldı:", oyuncu.isim);
      oyuncular = oyuncular.filter(o => o.id !== socket.id);
      hazirOyuncular = hazirOyuncular.filter(id => id !== socket.id);
      socket.broadcast.emit("mesaj", `${oyuncu.isim} oyundan ayrıldı`);
    }
    delete cevaplarListesi[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu aktif: http://localhost:${PORT}`);
});
