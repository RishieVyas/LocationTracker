package com.ritistracker

import android.app.*
import android.content.*
import android.content.res.Configuration
import android.location.Location
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import com.google.android.gms.tasks.OnCompleteListener
import com.google.gson.Gson
import com.ritistracker.MainActivity
import com.ritistracker.R
import com.ritistracker.Utils
import java.util.Date

class LocationUpdatesService : Service() {

    private val PACKAGE_NAME = "com.ritistracker"
    private val TAG = LocationUpdatesService::class.java.simpleName
    private val CHANNEL_ID = "channel_01"
    private val NOTIFICATION_ID = 12345678

    companion object {
        const val LOCATION_EVENT_NAME = "com.ritistracker.LOCATION_INFO"
        const val LOCATION_EVENT_DATA_NAME = "LocationData"
        const val ACTION_BROADCAST = "com.ritistracker.broadcast"
        const val EXTRA_LOCATION = "com.ritistracker.location"
        const val EXTRA_STARTED_FROM_NOTIFICATION = "com.ritistracker.started_from_notification"

        private const val UPDATE_INTERVAL_IN_MILLISECONDS: Long = 2000
        private const val FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS = UPDATE_INTERVAL_IN_MILLISECONDS / 2
    }

    private val mBinder = LocalBinder()
    private var mChangingConfiguration = false
    private lateinit var mNotificationManager: NotificationManager
    private lateinit var mLocationRequest: LocationRequest
    private lateinit var mFusedLocationClient: FusedLocationProviderClient
    private lateinit var mLocationCallback: LocationCallback
    private lateinit var mServiceHandler: Handler
    private var mLocation: Location? = null
    private val mGson = Gson()
    private lateinit var mEventReceiver: BroadcastReceiver

    override fun onCreate() {
        mFusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        mLocationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                super.onLocationResult(locationResult)
                val location = locationResult.lastLocation
                if (location != null) {
                    onNewLocation(location)
                } else {
                    Log.w(TAG, "Location is null")
                }
            }
        }

        createLocationRequest()
        getLastLocation()

        val handlerThread = HandlerThread(TAG)
        handlerThread.start()
        mServiceHandler = Handler(handlerThread.looper)
        mNotificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.app_name)
            val channel = NotificationChannel(CHANNEL_ID, name, NotificationManager.IMPORTANCE_MIN)
            mNotificationManager.createNotificationChannel(channel)
        }

        createEventReceiver()
        registerEventReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_NOT_STICKY
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        mChangingConfiguration = true
    }

    override fun onBind(intent: Intent?): IBinder {
        mChangingConfiguration = false
        return mBinder
    }

    override fun onRebind(intent: Intent?) {
        mChangingConfiguration = false
        super.onRebind(intent)
    }

    override fun onUnbind(intent: Intent?): Boolean {
        if (!mChangingConfiguration && Utils.requestingLocationUpdates(this)) {
            startForeground(NOTIFICATION_ID, getNotification())
        }
        return true
    }

    override fun onDestroy() {
        removeLocationUpdates()
        mServiceHandler.removeCallbacksAndMessages(null)
    }

    private fun createEventReceiver() {
        mEventReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val startStop = intent.getStringExtra("StartStopLocation")
                if (startStop == "START") {
                    requestLocationUpdates()
                } else {
                    removeLocationUpdates()
                }
            }
        }
    }


    private fun registerEventReceiver() {
        val eventFilter = IntentFilter().apply {
            addAction("LocationUpdatesService.startStopLocation")
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mEventReceiver, eventFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(mEventReceiver, eventFilter)
        }
    }

    private fun requestLocationUpdates() {
        Utils.setRequestingLocationUpdates(this, true)
        startService(Intent(applicationContext, LocationUpdatesService::class.java))
        startForeground(NOTIFICATION_ID, getNotification())
        try {
            mFusedLocationClient.requestLocationUpdates(mLocationRequest, mLocationCallback, Looper.myLooper())
        } catch (unlikely: SecurityException) {
            Utils.setRequestingLocationUpdates(this, false)
        }
    }

    private fun removeLocationUpdates() {
        try {
            mFusedLocationClient.removeLocationUpdates(mLocationCallback)
            Utils.setRequestingLocationUpdates(this, false)
            stopSelf()
            stopForeground(STOP_FOREGROUND_REMOVE)
        } catch (unlikely: SecurityException) {
            Utils.setRequestingLocationUpdates(this, true)
        }
    }

    private fun getNotification(): Notification {
        val activityPendingIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )

        val title = "LocationSample is tracking your movement."

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentIntent(activityPendingIntent)
            .setContentTitle(title)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setTicker(title)
            .setWhen(System.currentTimeMillis())

        return builder.build()
    }

    private fun getLastLocation() {
        try {
            mFusedLocationClient.lastLocation.addOnCompleteListener { task ->
                if (task.isSuccessful && task.result != null) {
                    mLocation = task.result
                }
            }
        } catch (unlikely: SecurityException) {
            Log.e(TAG, "Lost location permission. Could not get location. $unlikely")
        }
    }

    private fun onNewLocation(location: Location) {
        mLocation = location
        val intent = Intent(ACTION_BROADCAST).apply {
            putExtra(EXTRA_LOCATION, location)
        }
        sendBroadcast(intent)
        val locationCoordinates = createCoordinates(location.latitude, location.longitude)
        broadcastLocationReceived(locationCoordinates)
    }

    private fun createCoordinates(latitude: Double, longitude: Double): LocationCoordinates {
        return LocationCoordinates().apply {
            setLatitude(latitude)
            setLongitude(longitude)
            setTimestamp(Date().time)
        }
    }

    private fun broadcastLocationReceived(locationCoordinates: LocationCoordinates) {
        val eventIntent = Intent(LOCATION_EVENT_NAME).apply {
            putExtra(LOCATION_EVENT_DATA_NAME, mGson.toJson(locationCoordinates))
        }
        applicationContext.sendBroadcast(eventIntent)
    }

    private fun createLocationRequest() {
        mLocationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY, UPDATE_INTERVAL_IN_MILLISECONDS
        ).apply {
            setMinUpdateIntervalMillis(FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS)
        }.build()

    }

    inner class LocalBinder : Binder() {
        fun getService(): LocationUpdatesService = this@LocationUpdatesService
    }
}
