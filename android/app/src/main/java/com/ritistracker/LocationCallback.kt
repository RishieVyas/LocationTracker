package com.ritistracker

interface LocationCallback {
    fun onLocationUpdated(latitude: Double, longitude: Double)
}