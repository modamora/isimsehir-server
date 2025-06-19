package com.example.isimsehiroyunu

import com.example.isimsehiroyunu.veri.SocketHandler
import com.example.isimsehiroyunu.ui.ekranlar.AnaEkran
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import com.example.isimsehiroyunu.ui.ekranlar.*
import com.example.isimsehiroyunu.ui.theme.IsimSehirOyunuTheme
import com.example.isimsehiroyunu.veri.KelimeVerisi

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 🌐 BURAYI KENDİ SUNUCU IP’İNLE DEĞİŞTİR
        // Terminalde `ifconfig` (Mac) ya da `ipconfig` (Windows) komutu ile IP adresini öğren.
        SocketHandler.setSocket("http://192.168.1.45:3000") // << BURAYA KENDİ IP'İN GELECEK
        SocketHandler.establishConnection()

        setContent {
            IsimSehirOyunuTheme {
                val context = LocalContext.current
                val kelimeVerisi = remember { KelimeVerisi(context) }

                var oyuncuAdi by remember { mutableStateOf("") }
                var ekran by remember { mutableStateOf("giris") }

                var tur by remember { mutableStateOf(1) }
                val toplamTur = 10
                var harf by remember { mutableStateOf(rastgeleHarf()) }

                var cevaplar by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
                var puanlar by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
                var toplamPuan by remember { mutableStateOf(0) }

                when (ekran) {
                    "giris" -> AnaEkran(
                        oyuncuAdi = oyuncuAdi,
                        onOyuncuAdiGirildi = {
                            oyuncuAdi = it
                            SocketHandler.getSocket().emit("yeniOyuncu", it)
                            ekran = "oyun"
                        }
                    )

                    "oyun" -> OyunEkrani(
                        harf = harf,
                        turNo = tur,
                        toplamTur = toplamTur,
                        onCevaplariGonder = { gelenCevaplar ->
                            cevaplar = gelenCevaplar
                            puanlar = puanHesapla(gelenCevaplar, harf, kelimeVerisi)
                            toplamPuan += puanlar.values.sum()
                            ekran = if (tur == toplamTur) "sonuc" else "puan"
                        }
                    )

                    "puan" -> PuanEkrani(
                        puanlar = puanlar,
                        toplamPuan = toplamPuan,
                        onSonrakiTur = {
                            tur++
                            harf = rastgeleHarf()
                            ekran = "oyun"
                        }
                    )

                    "sonuc" -> SonucEkrani(
                        toplamPuan = toplamPuan,
                        onOyunuBitir = {
                            tur = 1
                            toplamPuan = 0
                            harf = rastgeleHarf()
                            ekran = "giris"
                        }
                    )
                }
            }
        }
    }
}

// ✅ Rastgele Türkçe harf üret
fun rastgeleHarf(): Char {
    return listOf(
        'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H',
        'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö',
        'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
    ).random()
}

// ✅ Puan hesaplama fonksiyonu
fun puanHesapla(
    cevaplar: Map<String, String>,
    harf: Char,
    kelimeVerisi: KelimeVerisi
): Map<String, Int> {
    return cevaplar.mapValues { (kategori, kelime) ->
        val temizKelime = kelime.trim().lowercase()
        if (!temizKelime.startsWith(harf.lowercaseChar())) return@mapValues 0

        val gecerli = when (kategori.lowercase()) {
            "isim" -> kelimeVerisi.isimler.contains(temizKelime)
            "şehir" -> kelimeVerisi.sehirler.contains(temizKelime)
            "hayvan" -> kelimeVerisi.hayvanlar.contains(temizKelime)
            "bitki" -> kelimeVerisi.bitkiler.contains(temizKelime)
            "eşya" -> kelimeVerisi.esyalar.contains(temizKelime)
            else -> false
        }

        if (gecerli) 10 else 0
    }
}
