package com.ritistracker

class LocationCoordinates {
    var latitude: Double = 0.0
        private set
    var longitude: Double = 0.0
        private set
    var timestamp: Long = 0
        private set

    fun setLatitude(latitude: Double): LocationCoordinates {
        this.latitude = latitude
        return this
    }

    fun setLongitude(longitude: Double): LocationCoordinates {
        this.longitude = longitude
        return this
    }

    fun setTimestamp(timestamp: Long): LocationCoordinates {
        this.timestamp = timestamp
        return this
    }
}
