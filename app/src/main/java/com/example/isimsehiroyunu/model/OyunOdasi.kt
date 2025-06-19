package com.example.isimsehiroyunu.model

data class OyunOdasi(
    val odaKodu: String = "",
    val oyuncular: List<Kullanici> = emptyList(),
    val aktifHarf: Char = 'A',
    val turNo: Int = 1,
    val toplamTur: Int = 10
)
