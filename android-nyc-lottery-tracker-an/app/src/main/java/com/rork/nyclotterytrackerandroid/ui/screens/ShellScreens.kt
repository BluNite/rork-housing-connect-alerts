package com.rork.nyclotterytrackerandroid.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CloudOff
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.WifiOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.nyclotterytrackerandroid.R
import com.rork.nyclotterytrackerandroid.ui.theme.Brand
import com.rork.nyclotterytrackerandroid.ui.theme.PublicSans
import com.rork.nyclotterytrackerandroid.web.LoadFailure

private val CanvasWash = Brush.verticalGradient(
    0f to Brand.BlueTint,
    0.55f to Brand.Canvas,
    1f to Color.White,
)

/** Native branded screen shown while the site loads the first time. */
@Composable
fun LaunchOverlay() {
    val rise = remember { Animatable(0f) }
    LaunchedEffect(Unit) { rise.animateTo(1f, tween(560, easing = FastOutSlowInEasing)) }

    Box(Modifier.fillMaxSize().background(CanvasWash), contentAlignment = Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.graphicsLayer {
                alpha = rise.value
                translationY = (1f - rise.value) * 24.dp.toPx()
            },
        ) {
            Image(
                painter = painterResource(R.drawable.brand_mark),
                contentDescription = null,
                modifier = Modifier.size(112.dp).clip(RoundedCornerShape(28.dp)),
            )
            Spacer(Modifier.height(22.dp))
            BrandLockup()
            Spacer(Modifier.height(6.dp))
            Text(
                "Affordable housing lottery alerts",
                style = MaterialTheme.typography.bodyMedium,
                color = Brand.Muted,
            )
            Spacer(Modifier.height(28.dp))
            LinearProgressIndicator(
                color = Brand.Orange,
                trackColor = Brand.OrangeTint,
                gapSize = 0.dp,
                modifier = Modifier.width(120.dp).height(3.dp).clip(CircleShape),
            )
        }
    }
}

/** "NYC Lottery Tracker" with NYC in extra-bold, matching the web lockup. */
@Composable
private fun BrandLockup() {
    Text(
        buildAnnotatedString {
            withStyle(SpanStyle(fontWeight = FontWeight.ExtraBold, color = Brand.Blue)) { append("NYC ") }
            append("Lottery Tracker")
        },
        fontFamily = PublicSans,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        color = Brand.Ink,
        letterSpacing = (-0.3).sp,
    )
}

@Composable
fun OfflineScreen(kind: LoadFailure, onRetry: () -> Unit) {
    val haptics = LocalHapticFeedback.current
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(
        if (pressed) 0.96f else 1f,
        spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "retry-press",
    )

    val (icon, title, body) = when (kind) {
        LoadFailure.Offline -> Triple(
            Icons.Rounded.WifiOff,
            "You're offline",
            "We need a connection to load the latest lotteries. Your saved lotteries and alerts are safe.",
        )
        LoadFailure.Server -> Triple(
            Icons.Rounded.CloudOff,
            "We'll be right back",
            "The lottery service is taking a moment to respond. Please try again shortly.",
        )
    }

    Box(Modifier.fillMaxSize().background(CanvasWash), contentAlignment = Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 32.dp),
        ) {
            Box(
                Modifier.size(76.dp).clip(CircleShape).background(Color.White),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    Modifier.size(60.dp).clip(CircleShape).background(Brand.BlueTint),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, contentDescription = null, tint = Brand.Blue, modifier = Modifier.size(28.dp))
                }
            }
            Spacer(Modifier.height(24.dp))
            Text(title, style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
            Spacer(Modifier.height(10.dp))
            Text(
                body,
                style = MaterialTheme.typography.bodyLarge,
                color = Brand.Muted,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(32.dp))
            Button(
                onClick = {
                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    onRetry()
                },
                interactionSource = interaction,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Brand.Blue, contentColor = Color.White),
                contentPadding = ButtonDefaults.ContentPadding,
                modifier = Modifier.fillMaxWidth().height(52.dp).scale(scale),
            ) {
                Icon(Icons.Rounded.Refresh, contentDescription = null, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Try again", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}
