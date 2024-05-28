// TracesContext.js
import React, { createContext, useState, useContext } from 'react';
import { fetchApi } from './ApiUtils'

const TracesContext = createContext();

export const TracesProvider = ({ children }) => {
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postTraces, setPostTraces] = useState([])

    const createTraces = async (payload) => {
        console.log("Traces Payload", payload);
        try {
            const data = await fetchApi('/traces', 'POST', payload);
            console.log(" Traces Posted ", data);
            setPostTraces(data)
            setError(null);
        } catch (err) {
            setError(err.message);
            setPostTraces([]);
        }
    };

    const fetchTraces = async (tripId) => {
        setLoading(true);
        try {
            const data = await fetchApi(`/traces/${tripId}`, 'GET');
            setTraces(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setTraces([]);
        } finally {
            setLoading(false);
        }
    }

    const deleteTraces = async (traceId) => {
        setLoading(true);
        try {
            const data = await fetchApi(`/traces/${traceId}`, 'DELETE');
            console.log(" Traces Deleted ", data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const value = {
        traces,
        postTraces,
        loading,
        error,
        createTraces,
        fetchTraces,
        deleteTraces
    };

    return <TracesContext.Provider value={value}>{children}</TracesContext.Provider>;
};

export const useTraces = () => useContext(TracesContext);
