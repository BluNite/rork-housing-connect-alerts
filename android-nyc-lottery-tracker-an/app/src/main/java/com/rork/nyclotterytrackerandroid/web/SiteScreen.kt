package com.rork.nyclotterytrackerandroid.web

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.rork.nyclotterytrackerandroid.ui.screens.LaunchOverlay
import com.rork.nyclotterytrackerandroid.ui.screens.OfflineScreen
import com.rork.nyclotterytrackerandroid.ui.theme.Brand

enum class LoadFailure { Offline, Server }

@Composable
fun SiteScreen() {
    // Bumped when the web renderer crashes so a fresh WebView is built.
    var generation by remember { mutableIntStateOf(0) }
    key(generation) {
        SiteWebView(onRendererGone = { generation++ })
    }
}

@Composable
private fun SiteWebView(onRendererGone: () -> Unit) {
    val context = LocalContext.current
    var progress by remember { mutableIntStateOf(0) }
    var firstLoadDone by remember { mutableStateOf(false) }
    var failure by remember { mutableStateOf<LoadFailure?>(null) }
    var canGoBack by remember { mutableStateOf(false) }

    val webView = remember {
        buildWebView(
            context = context,
            onProgress = {
                progress = it
                // Reveal the page as soon as it's substantially rendered instead of
                // waiting for every image — a big win for perceived cold-start speed.
                if (!firstLoadDone && it >= 75 && failure == null) firstLoadDone = true
            },
            onFinished = { view ->
                if (failure == null) firstLoadDone = true
                canGoBack = view.canGoBack()
            },
            onHistory = { canGoBack = it },
            onFailure = { failure = it },
            onRendererGone = onRendererGone,
        )
    }

    val lifecycle = LocalLifecycleOwner.current.lifecycle
    DisposableEffect(lifecycle, webView) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> { webView.onResume(); webView.resumeTimers() }
                Lifecycle.Event.ON_PAUSE -> {
                    webView.onPause(); webView.pauseTimers()
                    CookieManager.getInstance().flush()
                }
                else -> Unit
            }
        }
        lifecycle.addObserver(observer)
        onDispose {
            lifecycle.removeObserver(observer)
            webView.stopLoading()
            webView.destroy()
        }
    }

    BackHandler(enabled = canGoBack && failure == null) { webView.goBack() }

    Box(
        Modifier
            .fillMaxSize()
            .background(Color.White)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        AndroidView(factory = { webView }, modifier = Modifier.fillMaxSize())

        AnimatedVisibility(
            visible = firstLoadDone && failure == null && progress in 1..99,
            enter = fadeIn(tween(120)),
            exit = fadeOut(tween(300)),
            modifier = Modifier.align(Alignment.TopCenter),
        ) {
            LinearProgressIndicator(
                progress = { progress / 100f },
                color = Brand.Orange,
                trackColor = Color.Transparent,
                gapSize = 0.dp,
                drawStopIndicator = {},
                modifier = Modifier.fillMaxWidth().height(3.dp),
            )
        }

        AnimatedVisibility(
            visible = !firstLoadDone && failure == null,
            enter = fadeIn(tween(0)),
            exit = fadeOut(tween(420)),
        ) { LaunchOverlay() }

        AnimatedVisibility(visible = failure != null, enter = fadeIn(tween(220)), exit = fadeOut(tween(180))) {
            OfflineScreen(
                kind = failure ?: LoadFailure.Offline,
                onRetry = {
                    failure = null
                    if (webView.url.isNullOrEmpty()) webView.loadUrl(SiteConfig.START_URL) else webView.reload()
                },
            )
        }
    }
}

@SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
private fun buildWebView(
    context: Context,
    onProgress: (Int) -> Unit,
    onFinished: (WebView) -> Unit,
    onHistory: (Boolean) -> Unit,
    onFailure: (LoadFailure) -> Unit,
    onRendererGone: () -> Unit,
): WebView = WebView(context).apply {
    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    setBackgroundColor(android.graphics.Color.WHITE)
    overScrollMode = WebView.OVER_SCROLL_NEVER

    settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        allowFileAccess = false
        allowContentAccess = false
        mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        setSupportMultipleWindows(false)
        javaScriptCanOpenWindowsAutomatically = false
        mediaPlaybackRequiresUserGesture = true
        cacheMode = WebSettings.LOAD_DEFAULT
        userAgentString = "$userAgentString ${SiteConfig.UA_MARKER}"
    }
    CookieManager.getInstance().setAcceptCookie(true)

    val view = this
    addJavascriptInterface(FileBridge(context) { SiteConfig.isOwn(view.url?.toUri()) }, FileBridge.NAME)

    webChromeClient = object : WebChromeClient() {
        override fun onProgressChanged(view: WebView, newProgress: Int) = onProgress(newProgress)
    }

    webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val target = request.url
            if (!request.isForMainFrame) return false
            val current = view.url?.toUri()
            val stayInApp = SiteConfig.isOwn(target) || SiteConfig.isStripe(target) ||
                // Card checks (3-D Secure) may hop to a bank page mid-payment — keep those in-app.
                (SiteConfig.isStripe(current) && target.scheme == "https")
            if (stayInApp) return false
            openExternally(view.context, target)
            return true
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) = onProgress(5)

        override fun onPageFinished(view: WebView, url: String?) {
            if (SiteConfig.isOwn(url?.toUri())) view.evaluateJavascript(FileBridge.SHIM, null)
            onFinished(view)
        }

        override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) =
            onHistory(view.canGoBack())

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (request.isForMainFrame) onFailure(LoadFailure.Offline)
        }

        override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, response: WebResourceResponse) {
            if (request.isForMainFrame && response.statusCode >= 500 && SiteConfig.isOwn(request.url)) {
                onFailure(LoadFailure.Server)
            }
        }

        override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
            onRendererGone()
            return true
        }
    }

    loadUrl(SiteConfig.START_URL)
}

private val EXTERNAL_SCHEMES = setOf("http", "https", "mailto", "tel", "sms", "geo", "market")

private fun openExternally(context: Context, uri: Uri) {
    if (uri.scheme?.lowercase() !in EXTERNAL_SCHEMES) return
    try {
        context.startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) { /* nothing can open it */ }
}
