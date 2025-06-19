package com.example.isimsehiroyunu.model

data class OyunDurumu(
    val oyuncuSkor: Int = 0,
    val bilgisayarSkor: Int = 0,
    val turSayisi: Int = 0,
    val bitis: Boolean = false,
    val kazanan: String? = null
)
