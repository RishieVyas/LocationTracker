package com.ritistracker

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import com.facebook.react.ReactActivity
import com.ritistracker.LocationUpdatesService

class MainActivity : ReactActivity() {

    // Tracks the bound state of the service.
    private var mBound: Boolean = false

    // Monitors the state of the connection to the service.
    private val mServiceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val binder = service as LocationUpdatesService.LocalBinder
            mBound = true
        }

        override fun onServiceDisconnected(name: ComponentName) {
            mBound = false
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String {
        return "RitisTracker"
    }

    // @Override
    // protected ReactActivityDelegate createReactActivityDelegate() {
    //     return new ReactActivityDelegate(this, getMainComponentName()) {
    //         @Override
    //         protected ReactRootView createRootView() {
    //             return new RNGestureHandlerEnabledRootView(MainActivity.this);
    //         }
    //     };
    // }

    override fun onStart() {
        super.onStart()
        bindService(
            Intent(this, LocationUpdatesService::class.java),
            mServiceConnection,
            Context.BIND_AUTO_CREATE
        )
    }

    override fun onStop() {
        if (mBound) {
            // Unbind from the service. This signals to the service that this activity is no longer
            // in the foreground, and the service can respond by promoting itself to a foreground
            // service.
            unbindService(mServiceConnection)
            mBound = false
        }
        super.onStop()
    }
}
