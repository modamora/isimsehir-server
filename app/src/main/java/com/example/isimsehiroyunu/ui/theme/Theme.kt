package com.example.isimsehiroyunu.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CustomColorScheme = lightColorScheme(
    primary = Lila,
    onPrimary = Color.White,
    secondary = Pembe,
    onSecondary = Color.White,
    background = ArkaPlan,
    onBackground = YaziRenk,
    surface = FistikYesili,
    onSurface = Color.Black
)

@Composable
fun IsimSehirOyunuTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = CustomColorScheme,
        typography = Typography,
        content = content
    )
}
