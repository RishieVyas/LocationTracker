// TracesContext.js
import React, { createContext, useState, useContext } from 'react';
import { fetchApi } from './ApiUtils'

const TripsContext = createContext();

export const useTrips = () => useContext(TripsContext);

export const TripsProvider = ({ children }) => {
    const [trips, setTrips] = useState([]);
    const [newTrip, setNewTrip] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [loadingNewTrips, setLoadingNewTrips] = useState(false);
    const [errorTrips, setErrorTrips] = useState(null);
    const [deleteTripRes, setDeleteTripRes] = useState(false);
    const [tripId, setTripId] = useState("")

    const createTrips = async (payload) => {
        try {
            return await fetchApi('/trips', 'POST', payload);
            
        } catch (err) {
            setErrorTrips(err.message);
            setNewTrip([]);
        }
    };

    const fetchTrips = async (deviceId) => {
        console.log("Fetching Trips called", deviceId);
        setLoadingTrips(true);
        try {
            if (deviceId == " ") {
                const data = await fetchApi(`/trips`, 'GET');
                setTrips(data);
                console.log("trips data", data);
                return trips;
            } else {
                const data = await fetchApi(`/trips?${deviceId}`, 'GET');
                setTrips(data);
                return trips;  
            }
        } catch (err) {
            setErrorTrips(err.message);
            setTrips([]);
        } finally {
            setLoadingTrips(false);
        }
    }

    const deleteTrips = async (tripId) => {
        setLoadingTrips(true);
        try {
            return await fetchApi(`/trips/${tripId}`, 'DELETE');
        } catch (err) {
            setErrorTrips(err.message);
        } finally {
            setLoadingTrips(false);
        }
    }

    const patchTrip = (tripId, status) => {
        try {
            return fetchApi(`/trips/${tripId}`, 'PATCH', status);
        } catch (err) {
            setErrorTrips(err.message);
        }
    } 

    const value = {
        trips,
        loadingTrips,
        errorTrips,
        deleteTripRes,
        tripId,
        createTrips,
        fetchTrips,
        deleteTrips,
        newTrip,
        loadingNewTrips,
        patchTrip,
        setTripId
    };

    return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
};
