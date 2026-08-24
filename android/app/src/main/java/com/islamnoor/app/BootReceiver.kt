package com.islamnoor.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            // Restore saved scheduled prayer alarms from SharedPreferences or signal app on relaunch
            val prefs = context.getSharedPreferences("IslamNoorPrayerAlarms", Context.MODE_PRIVATE)
            val jsonAlarms = prefs.getString("scheduled_alarms_json", null)
            
            if (!jsonAlarms.isNullOrEmpty()) {
                PrayerSchedulerPlugin.restoreSavedAlarms(context, jsonAlarms)
            }
        }
    }
}
