// TracesContext.js
import React, { createContext, useState, useContext } from 'react';
import { fetchApi } from './ApiUtils'

const TripsContext = createContext();

export const TracesProvider = ({ children }) => {
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [errorTrips, setErrorTrips] = useState(null);

    const createTrips = async (payload) => {
        try {
            const data = await fetchApi('/trips', 'POST', payload);
            console.log(" Traces Posted ", data);
            setErrorTrips(null);
        } catch (err) {
            setErrorTrips(err.message);
            setTraces([]);
        }
    };

    const fetchTrips = async (deviceId) => {
        setLoadingTrips(true);
        try {
            const data = await fetchApi(`/trips/${deviceId}`, 'GET');
            setTrips(data);
            setErrorTrips(null);
        } catch (err) {
            setErrorTrips(err.message);
            setTraces([]);
        } finally {
            setLoadingTrips(false);
        }
    }

    const deleteTrips = async (tripId) => {
        setLoadingTrips(true);
        try {
            const data = await fetchApi(`/trips/${tripId}`, 'DELETE');
            console.log(" Traces Deleted ", data);
            setErrorTrips(null);
        } catch (err) {
            setErrorTrips(err.message);
        } finally {
            setLoadingTrips(false);
        }
    }

    const value = {
        trips,
        loadingTrips,
        errorTrips,
        createTrips,
        fetchTrips,
        deleteTrips
    };

    return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
};

export const useTrips = () => useContext(TripsContext);
