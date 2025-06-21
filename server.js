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
let cevaplarListesi = {}; // socket.id -> { isim, cevaplar }

io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  socket.on("yeniOyuncu", (isim) => {
    socket.data.isim = isim;
    oyuncular.push({ id: socket.id, isim });
    console.log("🧑 Yeni Oyuncu:", isim);

    socket.emit("mesaj", `Hoşgeldin ${isim}, keyifli oyunlar!`);
    socket.broadcast.emit("mesaj", `${isim} oyuna katıldı`);

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
      const harfler = [..."ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ"];
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

    if (Object.keys(cevaplarListesi).length === 2) {
      const ids = Object.keys(cevaplarListesi);
      const [id1, id2] = ids;
      const oyuncu1 = cevaplarListesi[id1];
      const oyuncu2 = cevaplarListesi[id2];

      const kategoriler = ["isim", "şehir", "hayvan", "bitki", "eşya"];
      const puanlar1 = {};
      const puanlar2 = {};

      let toplam1 = 0;
      let toplam2 = 0;

      kategoriler.forEach((kat) => {
        const c1 = (oyuncu1.cevaplar[kat] || "").toLowerCase().trim();
        const c2 = (oyuncu2.cevaplar[kat] || "").toLowerCase().trim();
        const ayni = c1 !== "" && c1 === c2;

        const p1 = c1 === "" ? 0 : ayni ? 5 : 10;
        const p2 = c2 === "" ? 0 : ayni ? 5 : 10;

        puanlar1[kat] = p1;
        puanlar2[kat] = p2;

        toplam1 += p1;
        toplam2 += p2;
      });

      // ✅ Oyuncu 1’e kendi ve rakibin cevaplarını gönder
      io.to(id1).emit("puanSonucu", {
        benim: oyuncu1.cevaplar,
        rakip: {
          isim: oyuncu2.isim,
          cevaplar: oyuncu2.cevaplar
        },
        puanlar: puanlar1,
        toplam: toplam1,
        rakipToplam: toplam2
      });

      // ✅ Oyuncu 2’ye kendi ve rakibin cevaplarını gönder
      io.to(id2).emit("puanSonucu", {
        benim: oyuncu2.cevaplar,
        rakip: {
          isim: oyuncu1.isim,
          cevaplar: oyuncu1.cevaplar
        },
        puanlar: puanlar2,
        toplam: toplam2,
        rakipToplam: toplam1
      });

      // 🔄 Temizle
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
