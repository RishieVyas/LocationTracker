package com.ritistracker

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap

interface JSEventSender {
    fun sendEventToJS(reactContext: ReactContext, eventName: String, params: WritableMap)
}
