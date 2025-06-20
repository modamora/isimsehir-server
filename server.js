const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Oyuncuları ve cevapları saklayacağımız yapılar
let oyuncular = [];
let cevaplar = {}; // { isim: { cevaplar: {}, puan: 0 } }

// ✅ Oyuncu bağlanınca
io.on("connection", (socket) => {
    console.log("✅ Yeni bağlantı:", socket.id);

    // Oyuncu adını al
    socket.on("yeniOyuncu", (isim) => {
        console.log("🧑 Yeni oyuncu:", isim);
        oyuncular.push({ id: socket.id, isim });
    });

    // Cevap geldiğinde
    socket.on("cevapGonder", (data) => {
        try {
            const oyuncu = oyuncular.find((o) => o.id === socket.id);
            if (!oyuncu) return;

            const isim = oyuncu.isim;
            const cevaplarJson = data.cevaplar;

            const cevapMap = {};
            for (const kategori in cevaplarJson) {
                cevapMap[kategori] = cevaplarJson[kategori];
            }

            // Basit puan hesapla (gelişmişi client tarafında yapılmış zaten)
            const puan = Object.values(cevapMap).filter((s) => s.trim().length > 0).length * 10;

            cevaplar[isim] = { cevaplar: cevapMap, puan };

            console.log(`📩 ${isim} cevap verdi. Puan: ${puan}`);
        } catch (err) {
            console.error("❌ cevapGonder hatası:", err);
        }
    });

    // İstemci puanları görmek istiyor
    socket.on("puanIstegi", () => {
        const liste = [];

        for (const isim in cevaplar) {
            liste.push({
                isim: isim,
                puan: cevaplar[isim].puan,
            });
        }

        // 👥 Her oyuncuya aynı puanlar gönder
        socket.emit("rakipPuanlari", { oyuncular: liste });
    });

    // Oyuncu ayrılırsa listeden çıkar
    socket.on("disconnect", () => {
        console.log("❌ Oyuncu ayrıldı:", socket.id);
        oyuncular = oyuncular.filter((o) => o.id !== socket.id);
        for (const isim in cevaplar) {
            if (oyuncular.find((o) => o.isim === isim) === undefined) {
                delete cevaplar[isim];
            }
        }
    });
});

// Sunucuyu başlat
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
