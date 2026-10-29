package com.rork.nyclotterytrackerandroid.web

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File

/**
 * Receives files the web app "downloads" (calendar .ics reminders, the account
 * data export) and hands them to Android: calendar files open in the calendar
 * app, everything else goes to the share sheet so the user picks where it lands.
 */
class FileBridge(
    private val context: Context,
    private val isTrustedPage: () -> Boolean,
) {
    private val main = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun save(rawName: String?, rawMime: String?, base64: String?) {
        if (base64.isNullOrEmpty() || base64.length > MAX_BASE64) return
        main.post {
            if (!isTrustedPage()) return@post
            runCatching { deliver(rawName, rawMime, base64) }
                .onFailure { toast("Couldn't open that file.") }
        }
    }

    private fun deliver(rawName: String?, rawMime: String?, base64: String) {
        val bytes = Base64.decode(base64, Base64.DEFAULT)
        val name = sanitize(rawName)
        val mime = when {
            name.endsWith(".ics", true) -> "text/calendar"
            name.endsWith(".json", true) -> "application/json"
            else -> rawMime?.takeIf { MIME_RE.matches(it) } ?: "application/octet-stream"
        }
        val dir = File(context.cacheDir, "shared").apply { mkdirs() }
        dir.listFiles()?.forEach { it.delete() } // keep only the latest file
        val file = File(dir, name).apply { writeBytes(bytes) }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)

        val view = Intent(Intent.ACTION_VIEW).setDataAndType(uri, mime)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        val send = Intent(Intent.ACTION_SEND).setType(mime)
            .putExtra(Intent.EXTRA_STREAM, uri)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        val share = Intent.createChooser(send, "Save or share $name")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

        if (mime == "text/calendar") {
            try {
                context.startActivity(view); return
            } catch (_: ActivityNotFoundException) { /* fall through to share */ }
        }
        context.startActivity(share)
    }

    private fun sanitize(raw: String?): String {
        val cleaned = (raw ?: "").substringAfterLast('/').replace(Regex("[^A-Za-z0-9._-]"), "_").take(80)
        return cleaned.ifBlank { "download" }.let { if (it.startsWith(".")) "file$it" else it }
    }

    private fun toast(msg: String) = Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()

    companion object {
        const val NAME = "LTAndroidFiles"
        private const val MAX_BASE64 = 8 * 1024 * 1024 // ~6 MB of file data
        private val MIME_RE = Regex("^[a-z]+/[a-z0-9.+-]+$")

        /**
         * Injected after each page load. Remembers blobs as the app creates them and
         * routes `<a download href="blob:…">` clicks to the bridge (WebView can't save blobs).
         */
        val SHIM = """
            (function(){
              if (window.__ltShim || !window.$NAME) return; window.__ltShim = 1;
              var blobs = new Map(), make = URL.createObjectURL;
              URL.createObjectURL = function(o){ var u = make.call(URL, o); if (o instanceof Blob) blobs.set(u, o); return u; };
              var click = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function(){
                var b = this.href && blobs.get(this.href);
                if (!b || !this.hasAttribute('download')) return click.call(this);
                var name = this.getAttribute('download') || 'download';
                blobs.delete(this.href);
                var r = new FileReader();
                r.onload = function(){ window.$NAME.save(name, b.type || '', String(r.result).split(',')[1] || ''); };
                r.readAsDataURL(b);
              };
            })();
        """.trimIndent()
    }
}
