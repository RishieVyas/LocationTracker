package com.ritistracker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson

class LocationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), JSEventSender {

    companion object {
        private const val MODULE_NAME = "LocationManager"
        private const val CONST_JS_LOCATION_EVENT_NAME = "JS_LOCATION_EVENT_NAME"
        private const val CONST_JS_LOCATION_LAT = "JS_LOCATION_LAT_KEY"
        private const val CONST_JS_LOCATION_LON = "JS_LOCATION_LON_KEY"
        private const val CONST_JS_LOCATION_TIME = "JS_LOCATION_TIME_KEY"
        const val JS_LOCATION_LAT_KEY = "latitude"
        const val JS_LOCATION_LON_KEY = "longitude"
        const val JS_LOCATION_TIME_KEY = "timestamp"
        const val JS_LOCATION_EVENT_NAME = "location_received"
    }

    private val mContext: Context = reactContext
    private lateinit var mEventReceiver: BroadcastReceiver
    private val mGson = Gson()

    init {
        createEventReceiver()
        registerEventReceiver()
    }

    @ReactMethod
    fun startBackgroundLocation() {
        val eventIntent = Intent("LocationUpdatesService.startStopLocation")
        eventIntent.putExtra("StartStopLocation", "START")
        reactApplicationContext.sendBroadcast(eventIntent)
    }

    @ReactMethod
    fun stopBackgroundLocation() {
        val eventIntent = Intent("LocationUpdatesService.startStopLocation")
        eventIntent.putExtra("StartStopLocation", "STOP")
        reactApplicationContext.sendBroadcast(eventIntent)
    }


    override fun getConstants(): Map<String, Any> {
        return mapOf(
            CONST_JS_LOCATION_EVENT_NAME to JS_LOCATION_EVENT_NAME,
            CONST_JS_LOCATION_LAT to JS_LOCATION_LAT_KEY,
            CONST_JS_LOCATION_LON to JS_LOCATION_LON_KEY,
            CONST_JS_LOCATION_TIME to JS_LOCATION_TIME_KEY
        )
    }

    override fun getName(): String {
        return MODULE_NAME
    }

    private fun createEventReceiver() {
        mEventReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val locationCoordinates = mGson.fromJson(
                    intent.getStringExtra(LocationUpdatesService.LOCATION_EVENT_DATA_NAME),
                    LocationCoordinates::class.java
                )

                val eventData: WritableMap = Arguments.createMap().apply {
                    putDouble(JS_LOCATION_LAT_KEY, locationCoordinates.latitude)
                    putDouble(JS_LOCATION_LON_KEY, locationCoordinates.longitude)
                    putDouble(JS_LOCATION_TIME_KEY, locationCoordinates.timestamp.toDouble())
                }

                sendEventToJS(reactApplicationContext, JS_LOCATION_EVENT_NAME, eventData)
            }
        }
    }

    private fun registerEventReceiver() {
        val eventFilter = IntentFilter().apply {
            addAction(LocationUpdatesService.LOCATION_EVENT_NAME)
        }
        mContext.registerReceiver(mEventReceiver, eventFilter)
    }

    override fun sendEventToJS(reactContext: ReactContext, eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
