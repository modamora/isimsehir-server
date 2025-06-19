package com.example.isimsehiroyunu.util

object HarfSecici {
    private val harfler = listOf(
        'A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L',
        'M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'
    )

    fun rastgeleHarf(): Char = harfler.random()
}
