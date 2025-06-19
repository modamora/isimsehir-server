package com.example.isimsehiroyunu.util

import com.example.isimsehiroyunu.model.Cevap
import com.example.isimsehiroyunu.model.OyunDurumu
import com.example.isimsehiroyunu.veri.KelimeVerisi

class OyunKontrol(private val kelimeVerisi: KelimeVerisi) {
    private var skorOyuncu = 0
    private var skorBilgisayar = 0
    private var tur = 0

    fun oynat(oyuncuCevap: Cevap): OyunDurumu {
        val bilgisayarCevap = Cevap(
            isim = kelimeVerisi.isimler.random(),
            sehir = kelimeVerisi.sehirler.random(),
            hayvan = kelimeVerisi.hayvanlar.random(),
            bitki = kelimeVerisi.bitkiler.random(),
            esya = kelimeVerisi.esyalar.random()
        )

        val degerlendirici = Degerlendirici(kelimeVerisi)
        val sonucOyuncu = degerlendirici.degerlendir(oyuncuCevap)
        val sonucBilgisayar = degerlendirici.degerlendir(bilgisayarCevap)

        skorOyuncu += puanla(sonucOyuncu, sonucBilgisayar)
        skorBilgisayar += puanla(sonucBilgisayar, sonucOyuncu)

        tur++

        val kazanan = when {
            skorOyuncu >= 100 -> "Oyuncu"
            skorBilgisayar >= 100 -> "Bilgisayar"
            else -> null
        }

        return OyunDurumu(
            oyuncuSkor = skorOyuncu,
            bilgisayarSkor = skorBilgisayar,
            turSayisi = tur,
            bitis = kazanan != null,
            kazanan = kazanan
        )
    }

    private fun puanla(bir: Map<String, Boolean>, diger: Map<String, Boolean>): Int {
        var puan = 0
        bir.forEach { (kategori, sonuc) ->
            val digerSonuc = diger[kategori] ?: false
            puan += when {
                sonuc && digerSonuc -> 5 // beraberlik
                sonuc && !digerSonuc -> 10
                else -> 0
            }
        }
        return puan
    }
}
