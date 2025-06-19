package com.example.isimsehiroyunu.veri

import android.content.Context
import com.example.isimsehiroyunu.R

class KelimeVerisi(context: Context) {
    val isimler = oku(context, R.raw.isimler)
    val sehirler = oku(context, R.raw.sehirler)
    val hayvanlar = oku(context, R.raw.hayvanlar)
    val bitkiler = oku(context, R.raw.bitkiler)
    val esyalar = oku(context, R.raw.esyalar)

    private fun oku(context: Context, id: Int): List<String> {
        return context.resources.openRawResource(id)
            .bufferedReader(Charsets.UTF_8).readLines()
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
    }
}
