package com.rork.nyclotterytrackerandroid.web

import android.net.Uri

object SiteConfig {
    const val START_URL = "https://housinglotteryalerts.com/"

    /** Marker the web app reads to know it runs inside this shell (hides AdSense, etc.). */
    const val UA_MARKER = "NYCLotteryTrackerAndroid/1.0"

    /** Our own site — the only pages allowed to use the file bridge. */
    private val OWN_HOSTS = setOf(
        "housinglotteryalerts.com",
        "www.housinglotteryalerts.com",
        "housing-lottery-tracker.rork.app",
    )

    /** Stripe Checkout + billing portal stay in-app so the success URL returns here. */
    private val STRIPE_HOSTS = setOf("checkout.stripe.com", "billing.stripe.com")

    fun isOwn(uri: Uri?): Boolean =
        uri != null && uri.scheme == "https" && uri.host?.lowercase() in OWN_HOSTS

    fun isStripe(uri: Uri?): Boolean {
        val host = uri?.host?.lowercase() ?: return false
        return uri.scheme == "https" && (host in STRIPE_HOSTS || host.endsWith(".stripe.com") || host == "stripe.com")
    }
}
