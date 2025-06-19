package com.example.isimsehiroyunu.ui.ekranlar

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AnaEkran(
    oyuncuAdi: String,
    onOyuncuAdiGirildi: (String) -> Unit
) {
    var text by remember { mutableStateOf(TextFieldValue(oyuncuAdi)) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "🎮 Miray'ın Oyunu",
            fontSize = 26.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Oyuncu adınızı girin") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                val isim = text.text.trim()
                if (isim.isNotEmpty()) {
                    onOyuncuAdiGirildi(isim)
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Oyuna Katıl")
        }
    }
}
