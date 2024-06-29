package com.ritistracker

interface LocationCallback {
    fun onLocationUpdated(latitude: Double, longitude: Double, altitude: Double?, timestamp: Long, speed: Float?, heading: Float?)
}