package com.islamnoor.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(PrayerSchedulerPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
