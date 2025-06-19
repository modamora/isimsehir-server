package com.example.isimsehiroyunu.ui.ekranlar

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SonucEkrani(
    toplamPuan: Int,
    onOyunuBitir: () -> Unit
) {
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {

        Text("🎉 Oyun Bitti!", fontSize = 22.sp)
        Spacer(modifier = Modifier.height(8.dp))

        Text("Toplam Puanın: $toplamPuan", fontSize = 20.sp)
        Spacer(modifier = Modifier.height(24.dp))

        Button(onClick = onOyunuBitir, modifier = Modifier.fillMaxWidth()) {
            Text("Yeniden Oyna")
        }
    }
}
