package com.example.isimsehiroyunu.util

import com.example.isimsehiroyunu.model.Cevap
import com.example.isimsehiroyunu.veri.KelimeVerisi
import java.util.Locale

class Degerlendirici(private val kelimeVerisi: KelimeVerisi) {

    private val turkce = Locale("tr", "TR")

    fun degerlendir(cevap: Cevap): Map<String, Boolean> {
        return mapOf(
            "isim" to kelimeVerisi.isimler.contains(cevap.isim.trim().lowercase(turkce)),
            "sehir" to kelimeVerisi.sehirler.contains(cevap.sehir.trim().lowercase(turkce)),
            "hayvan" to kelimeVerisi.hayvanlar.contains(cevap.hayvan.trim().lowercase(turkce)),
            "bitki" to kelimeVerisi.bitkiler.contains(cevap.bitki.trim().lowercase(turkce)),
            "esya" to kelimeVerisi.esyalar.contains(cevap.esya.trim().lowercase(turkce))
        )
    }
}
