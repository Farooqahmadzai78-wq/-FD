package com.islamnoor.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.json.JSONObject

@CapacitorPlugin(name = "PrayerScheduler")
class PrayerSchedulerPlugin : Plugin() {

    @PluginMethod
    fun getNativePlatformStatus(call: PluginCall) {
        val context = context
        var canScheduleExact = true
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            canScheduleExact = alarmManager?.canScheduleExactAlarms() ?: true
        }

        var isIgnoringBattery = true
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            isIgnoringBattery = powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true
        }

        val ret = JSObject().apply {
            put("isNativeAndroid", true)
            put("alarmManagerAvailable", true)
            put("sdkVersion", Build.VERSION.SDK_INT)
            put("canScheduleExactAlarms", canScheduleExact)
            put("isIgnoringBatteryOptimizations", isIgnoringBattery)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestNativePermissions(call: PluginCall) {
        val context = context
        val ret = JSObject()

        var canScheduleExact = true
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            canScheduleExact = alarmManager?.canScheduleExactAlarms() ?: true
            if (!canScheduleExact) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                        data = Uri.parse("package:${context.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                } catch (e: Exception) {
                    try {
                        val fallback = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        context.startActivity(fallback)
                    } catch (_: Exception) {}
                }
            }
        }

        ret.put("canScheduleExactAlarms", canScheduleExact)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestBatteryOptimizationExemption(call: PluginCall) {
        val context = context
        var requested = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val isIgnoring = powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true
            if (!isIgnoring) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:${context.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    requested = true
                } catch (e: Exception) {
                    try {
                        val fallback = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        context.startActivity(fallback)
                        requested = true
                    } catch (_: Exception) {}
                }
            }
        }
        val ret = JSObject().apply { put("requested", requested) }
        call.resolve(ret)
    }

    @PluginMethod
    fun scheduleReminder(call: PluginCall) {
        val eventId = call.getString("eventId") ?: return call.reject("eventId required")
        val prayerName = call.getString("prayerName") ?: "Prière"
        val timestampMs = call.getLong("timestamp") ?: return call.reject("timestamp required")
        val mode = call.getString("mode") ?: "both"
        val title = call.getString("title") ?: "Islam-Noor — Rappel de prière"
        val notifText = call.getString("notifText") ?: call.getString("message") ?: "Rappel de prière"
        val audioText = call.getString("audioText") ?: ""
        val audioUrl = call.getString("audioUrl") ?: ""
        val isArabic = call.getBoolean("isArabic") ?: false
        val vibrate = call.getBoolean("vibrate") ?: true

        val success = setExactAlarm(
            eventId = eventId,
            type = PrayerAlarmReceiver.TYPE_REMINDER,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = mode,
            title = title,
            notifText = notifText,
            audioText = audioText,
            audioUrl = audioUrl,
            isArabic = isArabic,
            vibrate = vibrate
        )

        saveAlarmToPrefs(
            eventId = eventId,
            type = PrayerAlarmReceiver.TYPE_REMINDER,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = mode,
            title = title,
            notifText = notifText,
            audioText = audioText,
            audioUrl = audioUrl,
            isArabic = isArabic,
            vibrate = vibrate
        )

        val ret = JSObject().apply { put("success", success); put("eventId", eventId) }
        call.resolve(ret)
    }

    @PluginMethod
    fun scheduleAdhan(call: PluginCall) {
        val eventId = call.getString("eventId") ?: return call.reject("eventId required")
        val prayerName = call.getString("prayerName") ?: "Prière"
        val timestampMs = call.getLong("timestamp") ?: return call.reject("timestamp required")
        val imamId = call.getString("imamId") ?: "makkah"
        val title = call.getString("title") ?: "Islam-Noor — Adhan $prayerName"
        val message = call.getString("message") ?: "Il est l'heure de la prière de $prayerName"
        val audioUrl = call.getString("audioUrl") ?: ""
        val vibrate = call.getBoolean("vibrate") ?: true

        val success = setExactAlarm(
            eventId = eventId,
            type = PrayerAlarmReceiver.TYPE_AZAN,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = "both",
            title = title,
            notifText = message,
            audioText = "",
            audioUrl = audioUrl,
            isArabic = false,
            vibrate = vibrate
        )

        saveAlarmToPrefs(
            eventId = eventId,
            type = PrayerAlarmReceiver.TYPE_AZAN,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = "both",
            title = title,
            notifText = message,
            audioText = "",
            audioUrl = audioUrl,
            isArabic = false,
            vibrate = vibrate
        )

        val ret = JSObject().apply { put("success", success); put("eventId", eventId) }
        call.resolve(ret)
    }

    @PluginMethod
    fun scheduleTestAlarm(call: PluginCall) {
        val delaySeconds = call.getInt("delaySeconds") ?: 10
        val rawType = call.getString("type") ?: "reminder"
        val isAzan = rawType == PrayerAlarmReceiver.TYPE_AZAN || rawType.equals("adhan", ignoreCase = true)
        val type = if (isAzan) PrayerAlarmReceiver.TYPE_AZAN else PrayerAlarmReceiver.TYPE_REMINDER

        val prayerName = call.getString("prayerName") ?: "Fajr"
        val mode = call.getString("mode") ?: "both"
        val title = call.getString("title") ?: (if (isAzan) "Islam-Noor — Adhan $prayerName" else "Islam-Noor — Rappel de prière")
        val notifText = call.getString("notifText") ?: call.getString("message") ?: "Test du rappel"
        val audioText = call.getString("audioText") ?: ""
        val audioUrl = call.getString("audioUrl") ?: ""
        val isArabic = call.getBoolean("isArabic") ?: false
        val vibrate = call.getBoolean("vibrate") ?: true

        val timestampMs = System.currentTimeMillis() + (delaySeconds * 1000L)
        val eventId = "test_${if (isAzan) "adhan" else "rem"}_${System.currentTimeMillis()}"

        val success = setExactAlarm(
            eventId = eventId,
            type = type,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = mode,
            title = title,
            notifText = notifText,
            audioText = audioText,
            audioUrl = audioUrl,
            isArabic = isArabic,
            vibrate = vibrate
        )

        saveAlarmToPrefs(
            eventId = eventId,
            type = type,
            prayerName = prayerName,
            timestampMs = timestampMs,
            mode = mode,
            title = title,
            notifText = notifText,
            audioText = audioText,
            audioUrl = audioUrl,
            isArabic = isArabic,
            vibrate = vibrate
        )

        val ret = JSObject().apply {
            put("success", success)
            put("eventId", eventId)
            put("timestampMs", timestampMs)
            put("delaySeconds", delaySeconds)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getPendingAlarms(call: PluginCall) {
        val prefs = context.getSharedPreferences("IslamNoorPrayerAlarms", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("scheduled_alarms_json", "[]") ?: "[]"
        val ret = JSObject().apply { put("alarmsJson", jsonStr) }
        call.resolve(ret)
    }

    @PluginMethod
    fun cancelAll(call: PluginCall) {
        val prefs = context.getSharedPreferences("IslamNoorPrayerAlarms", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("scheduled_alarms_json", "[]") ?: "[]"
        try {
            val array = JSONArray(jsonStr)
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val eventId = obj.optString("eventId")
                if (eventId.isNotEmpty()) {
                    val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                        action = "com.islamnoor.app.ACTION_PRAYER_ALARM"
                    }
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        eventId.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    alarmManager.cancel(pendingIntent)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        prefs.edit().clear().apply()

        val ret = JSObject().apply { put("cancelled", true) }
        call.resolve(ret)
    }

    private fun setExactAlarm(
        eventId: String,
        type: String,
        prayerName: String,
        timestampMs: Long,
        mode: String,
        title: String,
        notifText: String,
        audioText: String,
        audioUrl: String,
        isArabic: Boolean,
        vibrate: Boolean
    ): Boolean {
        return try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                action = "com.islamnoor.app.ACTION_PRAYER_ALARM"
                putExtra("eventId", eventId)
                putExtra("type", type)
                putExtra("prayerName", prayerName)
                putExtra("mode", mode)
                putExtra("title", title)
                putExtra("notifText", notifText)
                putExtra("message", notifText)
                putExtra("audioText", audioText)
                putExtra("audioUrl", audioUrl)
                putExtra("isArabic", isArabic)
                putExtra("vibrate", vibrate)
            }

            val requestCode = eventId.hashCode()
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val showIntent = Intent(context, MainActivity::class.java)
            val showPendingIntent = PendingIntent.getActivity(
                context,
                requestCode + 1,
                showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                // setAlarmClock guarantees execution even in heavy Doze / locked screen
                val alarmClockInfo = AlarmManager.AlarmClockInfo(timestampMs, showPendingIntent)
                alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    timestampMs,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    timestampMs,
                    pendingIntent
                )
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun saveAlarmToPrefs(
        eventId: String,
        type: String,
        prayerName: String,
        timestampMs: Long,
        mode: String,
        title: String,
        notifText: String,
        audioText: String,
        audioUrl: String,
        isArabic: Boolean,
        vibrate: Boolean
    ) {
        try {
            val prefs = context.getSharedPreferences("IslamNoorPrayerAlarms", Context.MODE_PRIVATE)
            val existing = prefs.getString("scheduled_alarms_json", "[]") ?: "[]"
            val array = JSONArray(existing)
            val newArray = JSONArray()

            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                if (obj.optString("eventId") != eventId) {
                    newArray.put(obj)
                }
            }

            val item = JSONObject().apply {
                put("eventId", eventId)
                put("type", type)
                put("prayerName", prayerName)
                put("timestampMs", timestampMs)
                put("mode", mode)
                put("title", title)
                put("notifText", notifText)
                put("message", notifText)
                put("audioText", audioText)
                put("audioUrl", audioUrl)
                put("isArabic", isArabic)
                put("vibrate", vibrate)
            }

            newArray.put(item)
            prefs.edit().putString("scheduled_alarms_json", newArray.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        fun restoreSavedAlarms(context: Context, jsonStr: String) {
            try {
                val array = JSONArray(jsonStr)
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val now = System.currentTimeMillis()

                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    val timestampMs = obj.optLong("timestampMs", 0)
                    if (timestampMs > now) {
                        val eventId = obj.optString("eventId")
                        val notifText = obj.optString("notifText", obj.optString("message", "Islam-Noor"))
                        val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
                            action = "com.islamnoor.app.ACTION_PRAYER_ALARM"
                            putExtra("eventId", eventId)
                            putExtra("type", obj.optString("type"))
                            putExtra("prayerName", obj.optString("prayerName"))
                            putExtra("mode", obj.optString("mode"))
                            putExtra("title", obj.optString("title"))
                            putExtra("notifText", notifText)
                            putExtra("message", notifText)
                            putExtra("audioText", obj.optString("audioText"))
                            putExtra("audioUrl", obj.optString("audioUrl"))
                            putExtra("isArabic", obj.optBoolean("isArabic", false))
                            putExtra("vibrate", obj.optBoolean("vibrate", true))
                        }

                        val requestCode = eventId.hashCode()
                        val pendingIntent = PendingIntent.getBroadcast(
                            context,
                            requestCode,
                            intent,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )

                        val showIntent = Intent(context, MainActivity::class.java)
                        val showPendingIntent = PendingIntent.getActivity(
                            context,
                            requestCode + 1,
                            showIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            val alarmClockInfo = AlarmManager.AlarmClockInfo(timestampMs, showPendingIntent)
                            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timestampMs, pendingIntent)
                        } else {
                            alarmManager.setExact(AlarmManager.RTC_WAKEUP, timestampMs, pendingIntent)
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
