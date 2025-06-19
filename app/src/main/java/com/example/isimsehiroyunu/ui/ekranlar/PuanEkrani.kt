package com.example.isimsehiroyunu.ui.ekranlar

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.isimsehiroyunu.veri.SocketHandler
import org.json.JSONObject
import org.json.JSONArray

@Composable
fun PuanEkrani(
    puanlar: Map<String, Int>,
    toplamPuan: Int,
    onSonrakiTur: () -> Unit
) {
    var digerOyuncularCevaplari by remember { mutableStateOf<List<Pair<String, Int>>>(emptyList()) }
    var gosterButonuAktif by remember { mutableStateOf(false) }

    // 🔌 Sunucudan diğer oyuncuların cevaplarını al
    LaunchedEffect(Unit) {
        val socket = SocketHandler.getSocket()
        socket.on("rakipPuanlari") { args ->
            if (args.isNotEmpty()) {
                val gelen = args[0] as JSONObject
                val liste = mutableListOf<Pair<String, Int>>()
                val oyuncularJson = gelen.getJSONArray("oyuncular")

                for (i in 0 until oyuncularJson.length()) {
                    val item = oyuncularJson.getJSONObject(i)
                    val isim = item.getString("isim")
                    val puan = item.getInt("puan")
                    liste.add(isim to puan)
                }

                digerOyuncularCevaplari = liste
                gosterButonuAktif = true
            }
        }

        // Sunucuya istekte bulun
        socket.emit("puanIstegi")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("📊 Puan Ekranı", fontSize = 22.sp)
        Spacer(modifier = Modifier.height(16.dp))

        Text("🔢 Senin Puanların:", fontSize = 18.sp)
        puanlar.forEach { (kategori, puan) ->
            Text("• $kategori: $puan", fontSize = 16.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("🎯 Tur Toplamı: $toplamPuan puan", fontSize = 18.sp)

        Spacer(modifier = Modifier.height(24.dp))

        if (gosterButonuAktif) {
            Text("👥 Diğer Oyuncular:", fontSize = 18.sp)
            digerOyuncularCevaplari.forEach { (isim, puan) ->
                Text("- $isim: $puan puan", fontSize = 16.sp)
            }
        } else {
            Text("⏳ Diğer oyuncuların puanları bekleniyor...", fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onSonrakiTur,
            modifier = Modifier.fillMaxWidth(),
            enabled = gosterButonuAktif
        ) {
            Text("Sonraki Tura Geç")
        }
    }
}
