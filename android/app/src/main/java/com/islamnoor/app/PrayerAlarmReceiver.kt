package com.islamnoor.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class PrayerAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val TYPE_REMINDER = "REMINDER_BEFORE_PRAYER"
        const val TYPE_AZAN = "PRAYER_AZAN"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val eventId = intent.getStringExtra("eventId") ?: ""
        val rawType = intent.getStringExtra("type") ?: TYPE_AZAN
        val isReminder = rawType == TYPE_REMINDER || rawType.equals("reminder", ignoreCase = true)
        val isAzan = rawType == TYPE_AZAN || rawType.equals("adhan", ignoreCase = true)

        val prayerName = intent.getStringExtra("prayerName") ?: "Prière"
        val mode = intent.getStringExtra("mode") ?: "both" // "notification", "audio", "both"
        val title = intent.getStringExtra("title") ?: "Islam-Noor"
        val notifText = intent.getStringExtra("notifText")
            ?: intent.getStringExtra("message")
            ?: "Rappel de prière"
        val audioText = intent.getStringExtra("audioText") ?: ""
        val audioUrl = intent.getStringExtra("audioUrl") ?: ""
        val isArabic = intent.getBooleanExtra("isArabic", false)
        val vibrate = intent.getBooleanExtra("vibrate", true)

        // =========================================================================
        // CASE 1: PRE-PRAYER REMINDER (Triggered at T - 15min)
        // STRICT RULE: ONLY trigger the reminder configuration. NEVER play Azan.
        // =========================================================================
        if (isReminder) {
            // A. Show Notification (Mode: notification OR both)
            if (mode == "notification" || mode == "both") {
                showNotification(context, eventId.hashCode(), title, notifText, vibrate)
            }

            // B. Play Vocal Audio / Speech (Mode: audio OR both)
            if (mode == "audio" || mode == "both") {
                val serviceIntent = Intent(context, PrayerAudioService::class.java).apply {
                    putExtra("type", TYPE_REMINDER)
                    putExtra("prayerName", prayerName)
                    putExtra("mode", mode)
                    putExtra("title", title)
                    putExtra("notifText", notifText)
                    putExtra("audioText", audioText)
                    putExtra("audioUrl", audioUrl)
                    putExtra("isArabic", isArabic)
                    putExtra("vibrate", vibrate)
                }
                startAudioForegroundService(context, serviceIntent)
            }
            return
        }

        // =========================================================================
        // CASE 2: EXACT AZAN (Triggered at T = 0)
        // STRICT RULE: Play ONLY the selected reciter's Azan stream.
        // =========================================================================
        if (isAzan) {
            val serviceIntent = Intent(context, PrayerAudioService::class.java).apply {
                putExtra("type", TYPE_AZAN)
                putExtra("prayerName", prayerName)
                putExtra("mode", "both")
                putExtra("title", title)
                putExtra("notifText", notifText)
                putExtra("audioUrl", audioUrl)
                putExtra("vibrate", vibrate)
            }
            startAudioForegroundService(context, serviceIntent)
        }
    }

    private fun startAudioForegroundService(context: Context, serviceIntent: Intent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun showNotification(
        context: Context,
        notificationId: Int,
        title: String,
        message: String,
        vibrate: Boolean
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "islam_noor_prayer_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Rappels & Adhan Islam-Noor",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications précises pour les rappels de prière et l'Adhan"
                enableVibration(vibrate)
                if (vibrate) {
                    vibrationPattern = longArrayOf(0, 400, 200, 400)
                }
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        if (vibrate) {
            builder.setVibrate(longArrayOf(0, 400, 200, 400))
        }

        notificationManager.notify(notificationId, builder.build())
    }
}

