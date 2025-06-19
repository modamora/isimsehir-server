package com.example.isimsehiroyunu.ui.ekranlar

import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.example.isimsehiroyunu.veri.SocketHandler
import org.json.JSONObject

@Composable
fun OyunEkrani(
    harf: Char,
    turNo: Int,
    toplamTur: Int,
    onCevaplariGonder: (Map<String, String>) -> Unit
) {
    val kategoriler = listOf("İsim", "Şehir", "Hayvan", "Bitki", "Eşya")
    val cevaplar = remember { mutableStateMapOf<String, String>() }
    var kalanSure by remember { mutableStateOf(120) }
    var cevapGonderildi by remember { mutableStateOf(false) }

    fun gonderVeBitir() {
        cevapGonderildi = true
        onCevaplariGonder(cevaplar)

        // 🔌 Socket ile sunucuya JSON olarak cevapları gönder
        val json = JSONObject()
        json.put("tur", turNo)
        json.put("harf", harf.toString())

        val cevaplarJson = JSONObject()
        for ((kategori, cevap) in cevaplar) {
            cevaplarJson.put(kategori.lowercase(), cevap)
        }
        json.put("cevaplar", cevaplarJson)

        SocketHandler.getSocket().emit("cevapGonder", json)
    }

    // ⏳ Geri sayım başlat
    LaunchedEffect(key1 = turNo) {
        kalanSure = 120
        cevapGonderildi = false
        while (kalanSure > 0 && !cevapGonderildi) {
            delay(1000)
            kalanSure--
        }

        if (!cevapGonderildi) {
            gonderVeBitir()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("🕒 Kalan Süre: $kalanSure saniye", fontSize = 18.sp)
        Spacer(modifier = Modifier.height(8.dp))

        Text("Tur $turNo / $toplamTur", fontSize = 20.sp)
        Text("Harf: $harf", fontSize = 24.sp)
        Spacer(modifier = Modifier.height(16.dp))

        kategoriler.forEach { kategori ->
            OutlinedTextField(
                value = cevaplar[kategori] ?: "",
                onValueChange = { cevaplar[kategori] = it },
                label = { Text(kategori) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                if (!cevapGonderildi) {
                    gonderVeBitir()
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !cevapGonderildi
        ) {
            Text("Cevapları Gönder")
        }
    }
}
