package com.example.isimsehiroyunu.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.Call

data class Oyuncu(
    val oyuncuId: String,
    val isim: String
)

data class Cevaplar(
    val oyuncuId: String,
    val cevaplar: Map<String, String>,
    val harf: Char
)

data class Sonuc(
    val oyuncuId: String,
    val puan: Int
)

interface ApiService {

    @POST("/kayit-ol")
    fun kayitOl(@Body oyuncu: Oyuncu): Call<Unit>

    @POST("/cevap-gonder")
    fun cevapGonder(@Body cevap: Cevaplar): Call<Sonuc>

    @GET("/oyuncular")
    fun oyunculariGetir(): Call<List<Oyuncu>>

}
