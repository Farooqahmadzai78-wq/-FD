package com.islamnoor.app

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.Vibrator
import android.os.VibrationEffect
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.core.app.NotificationCompat
import java.util.Locale

class PrayerAudioService : Service(), TextToSpeech.OnInitListener {

    private var mediaPlayer: MediaPlayer? = null
    private var currentSessionId: Long = 0L
    private var wakeLock: PowerManager.WakeLock? = null
    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false
    private var pendingSpeechText: String? = null
    private var pendingSpeechLocale: Locale = Locale.FRENCH

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        createNotificationChannel()
        tts = TextToSpeech(applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            pendingSpeechText?.let { text ->
                speakWithTts(text, pendingSpeechLocale)
                pendingSpeechText = null
            }
        }
    }

    private fun stopAnyActivePlayback() {
        currentSessionId++
        try {
            tts?.stop()
        } catch (e: Exception) {
            // ignore
        }
        try {
            mediaPlayer?.let { mp ->
                if (mp.isPlaying) {
                    mp.stop()
                }
                mp.reset()
                mp.release()
            }
        } catch (e: Exception) {
            // ignore
        }
        mediaPlayer = null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Enforce strict single active playback: terminate any ongoing speech or playback
        stopAnyActivePlayback()

        val rawType = intent?.getStringExtra("type") ?: PrayerAlarmReceiver.TYPE_AZAN
        val isReminder = rawType == PrayerAlarmReceiver.TYPE_REMINDER || rawType.equals("reminder", ignoreCase = true)
        val isAzan = rawType == PrayerAlarmReceiver.TYPE_AZAN || rawType.equals("adhan", ignoreCase = true)

        val prayerName = intent?.getStringExtra("prayerName") ?: "Prière"
        val title = intent?.getStringExtra("title") ?: "Islam-Noor"
        val notifText = intent?.getStringExtra("notifText") ?: "Rappel de prière"
        val audioText = intent?.getStringExtra("audioText") ?: ""
        val audioUrl = intent?.getStringExtra("audioUrl") ?: ""
        val isArabic = intent?.getBooleanExtra("isArabic", false) ?: false
        val vibrate = intent?.getBooleanExtra("vibrate", true) ?: true

        acquireWakeLock()
        requestAudioFocus()

        if (vibrate) {
            triggerVibration()
        }

        // =========================================================================
        // CASE 1: EXACT AZAN PLAYBACK (T = 0)
        // STRICT RULE: Stream ONLY the selected reciter's Azan audio.
        // =========================================================================
        if (isAzan) {
            showForegroundNotification(title, "Adhan $prayerName en cours...")
            if (audioUrl.isNotEmpty()) {
                playAzanStream(audioUrl)
            } else {
                cleanupAndStop()
            }
            return START_NOT_STICKY
        }

        // =========================================================================
        // CASE 2: PRE-PRAYER REMINDER (T - 15min)
        // STRICT RULE: NEVER play Azan audio here! Only speak or play reminder.
        // =========================================================================
        if (isReminder) {
            showForegroundNotification(title, notifText)
            val textToSpeak = if (audioText.isNotBlank()) audioText else notifText
            val locale = if (isArabic || isArabicText(textToSpeak)) Locale("ar") else Locale.FRENCH

            // If a valid custom audio URL for reminder is provided (not an azan stream), play it;
            // otherwise use native Android TTS
            if (audioUrl.isNotEmpty() &&
                !audioUrl.contains("adhan", ignoreCase = true) &&
                (audioUrl.startsWith("http://") || audioUrl.startsWith("https://") || audioUrl.startsWith("file://"))
            ) {
                playReminderAudioUrl(audioUrl, textToSpeak, locale)
            } else {
                if (isTtsInitialized) {
                    speakWithTts(textToSpeak, locale)
                } else {
                    pendingSpeechText = textToSpeak
                    pendingSpeechLocale = locale
                }
            }
            return START_NOT_STICKY
        }

        cleanupAndStop()
        return START_NOT_STICKY
    }

    private fun isArabicText(text: String): Boolean {
        for (char in text) {
            val ub = Character.UnicodeBlock.of(char)
            if (ub == Character.UnicodeBlock.ARABIC ||
                ub == Character.UnicodeBlock.ARABIC_SUPPLEMENT ||
                ub == Character.UnicodeBlock.ARABIC_PRESENTATION_FORMS_A ||
                ub == Character.UnicodeBlock.ARABIC_PRESENTATION_FORMS_B
            ) {
                return true
            }
        }
        return false
    }

    private fun playAzanStream(url: String) {
        val thisSessionId = ++currentSessionId
        try {
            val mp = MediaPlayer()
            mediaPlayer = mp
            mp.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
            )
            mp.setDataSource(url)
            mp.setOnPreparedListener { preparedMp ->
                if (thisSessionId == currentSessionId && mediaPlayer == preparedMp) {
                    preparedMp.start()
                } else {
                    try {
                        preparedMp.stop()
                        preparedMp.release()
                    } catch (e: Exception) {
                        // ignore
                    }
                }
            }
            mp.setOnCompletionListener {
                if (thisSessionId == currentSessionId) {
                    cleanupAndStop()
                }
            }
            mp.setOnErrorListener { _, _, _ ->
                if (thisSessionId == currentSessionId) {
                    cleanupAndStop()
                }
                true
            }
            mp.prepareAsync()
        } catch (e: Exception) {
            e.printStackTrace()
            if (thisSessionId == currentSessionId) {
                cleanupAndStop()
            }
        }
    }

    private fun playReminderAudioUrl(url: String, fallbackText: String, locale: Locale) {
        val thisSessionId = ++currentSessionId
        try {
            val mp = MediaPlayer()
            mediaPlayer = mp
            mp.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
            )
            mp.setDataSource(url)
            mp.setOnPreparedListener { preparedMp ->
                if (thisSessionId == currentSessionId && mediaPlayer == preparedMp) {
                    preparedMp.start()
                } else {
                    try {
                        preparedMp.stop()
                        preparedMp.release()
                    } catch (e: Exception) {
                        // ignore
                    }
                }
            }
            mp.setOnCompletionListener {
                if (thisSessionId == currentSessionId) {
                    cleanupAndStop()
                }
            }
            mp.setOnErrorListener { _, _, _ ->
                if (thisSessionId == currentSessionId) {
                    // Fallback to Native TTS if custom reminder URL stream fails
                    if (isTtsInitialized && fallbackText.isNotEmpty()) {
                        speakWithTts(fallbackText, locale)
                    } else {
                        cleanupAndStop()
                    }
                }
                true
            }
            mp.prepareAsync()
        } catch (e: Exception) {
            e.printStackTrace()
            if (thisSessionId == currentSessionId) {
                if (isTtsInitialized && fallbackText.isNotEmpty()) {
                    speakWithTts(fallbackText, locale)
                } else {
                    cleanupAndStop()
                }
            }
        }
    }

    private fun speakWithTts(text: String, locale: Locale) {
        try {
            tts?.language = locale
            tts?.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
            )
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {}
                override fun onDone(utteranceId: String?) {
                    cleanupAndStop()
                }
                override fun onError(utteranceId: String?) {
                    cleanupAndStop()
                }
            })
            val params = HashMap<String, String>()
            params[TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID] = "prayer_reminder_${System.currentTimeMillis()}"
            @Suppress("DEPRECATION")
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params)
        } catch (e: Exception) {
            e.printStackTrace()
            cleanupAndStop()
        }
    }

    private fun triggerVibration() {
        try {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 400, 200, 400), -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(longArrayOf(0, 400, 200, 400), -1)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attr = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()
            focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(attr)
                .build()
            focusRequest?.let { audioManager?.requestAudioFocus(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager?.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        }
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "IslamNoor::PrayerAudioLock").apply {
            acquire(10 * 60 * 1000L) // 10 minutes max timeout
        }
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "islam_noor_audio_channel",
                "Islam-Noor Adhan & Rappels Audio",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Service audio en arrière-plan pour les rappels de prière et l'Adhan"
                setSound(null, null)
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun showForegroundNotification(title: String, body: String) {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, "islam_noor_audio_channel")
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1001, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(1001, notification)
        }
    }

    private fun cleanupAndStop() {
        releaseWakeLock()
        stopSelf()
    }

    override fun onDestroy() {
        mediaPlayer?.release()
        mediaPlayer = null
        tts?.stop()
        tts?.shutdown()
        tts = null
        releaseWakeLock()
        super.onDestroy()
    }
}
