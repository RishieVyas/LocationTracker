package com.rtnmylocation;

import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.ReactApplicationContext

class MyLocationModule(val context: ReactApplicationContext): NativeMyLocationSpec(context){
    override fun getName(): String {
        return NAME
    }

    private val REQUIRED_PERMISSIONS = mutableListOf(android.Manifest.permission.ACCESS_COARSE_LOCATION,
        android.Manifest.permission.ACCESS_FINE_LOCATION,
    ).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            add(android.Manifest.permission.POST_NOTIFICATIONS)
        }
    }.toTypedArray()
    private val REQUEST_CODE_PERMISSIONS = 10

    override fun getLocation() {
        Log.i("here123","000")
        context.currentActivity?.let {
            ActivityCompat.requestPermissions(
                it,
                REQUIRED_PERMISSIONS,
                REQUEST_CODE_PERMISSIONS
            )
        }
    }

    companion object {
        const val NAME = "RTNMyLocation"
    }
}