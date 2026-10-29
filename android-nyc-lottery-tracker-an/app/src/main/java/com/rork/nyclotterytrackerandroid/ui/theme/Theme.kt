package com.rork.nyclotterytrackerandroid.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.rork.nyclotterytrackerandroid.R

// Brand tokens — mirror .rork/DESIGN.md (blue + orange + white).
object Brand {
    val Blue = Color(0xFF1E6FE8)
    val BlueDeep = Color(0xFF1557C0)
    val BlueTint = Color(0xFFE9F2FF)
    val Orange = Color(0xFFF07C1F)
    val OrangeTint = Color(0xFFFDEEDD)
    val Canvas = Color(0xFFF8FAFD)
    val Surface = Color(0xFFFFFFFF)
    val Ink = Color(0xFF14243A)
    val Muted = Color(0xFF5A6B85)
    val Border = Color(0xFFE2E8F2)
}

@OptIn(ExperimentalTextApi::class)
private fun sans(w: Int) = Font(
    R.font.public_sans,
    weight = FontWeight(w),
    variationSettings = FontVariation.Settings(FontVariation.weight(w)),
)

@OptIn(ExperimentalTextApi::class)
private fun serif(w: Int) = Font(
    R.font.fraunces,
    weight = FontWeight(w),
    variationSettings = FontVariation.Settings(FontVariation.weight(w)),
)

val PublicSans = FontFamily(sans(400), sans(500), sans(600), sans(700), sans(800))
val Fraunces = FontFamily(serif(400), serif(600))

private val BrandColors = lightColorScheme(
    primary = Brand.Blue,
    onPrimary = Color.White,
    primaryContainer = Brand.BlueTint,
    onPrimaryContainer = Brand.BlueDeep,
    secondary = Brand.Orange,
    onSecondary = Color.White,
    secondaryContainer = Brand.OrangeTint,
    background = Brand.Canvas,
    onBackground = Brand.Ink,
    surface = Brand.Surface,
    onSurface = Brand.Ink,
    onSurfaceVariant = Brand.Muted,
    outline = Brand.Border,
)

private val BrandType = Typography(
    headlineMedium = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight(600), fontSize = 30.sp, lineHeight = 36.sp, color = Brand.Ink),
    titleMedium = TextStyle(fontFamily = PublicSans, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 24.sp),
    bodyLarge = TextStyle(fontFamily = PublicSans, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontFamily = PublicSans, fontWeight = FontWeight.Normal, fontSize = 15.sp, lineHeight = 22.sp),
    labelLarge = TextStyle(fontFamily = PublicSans, fontWeight = FontWeight.SemiBold, fontSize = 15.sp),
    labelMedium = TextStyle(fontFamily = PublicSans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp),
)

/** Light-only brand theme — the web app inside is light, so the shell matches it. */
@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = BrandColors, typography = BrandType, content = content)
}
