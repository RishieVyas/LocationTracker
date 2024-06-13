// TracesContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchApi } from './ApiUtils'

const TracesContext = createContext();

export const TracesProvider = ({ children }) => {
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postTraces, setPostTraces] = useState({})
    const [sosActive, setsosActive] = useState(false)

    const createTraces = async (payload) => {
        console.log("Traces Payload", payload);
        try {
            const data = await fetchApi('/traces', 'POST', payload);
            console.log(" Traces Posted of the trip", data);
            setPostTraces(data)
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            setPostTraces([]);
        }
    };

    const fetchTraces = async (tripId) => {
        setLoading(true);
        try {
            const data = await fetchApi(`/traces?tripId=${tripId}`, 'GET');
            setTraces(data.items);
            setError(null);
            return data;
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
            const data = await fetchApi(`/traces?tripId=${traceId}`, 'DELETE');
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
        deleteTraces,
        setPostTraces,
        setTraces,
        sosActive, 
        setsosActive
    };

    return <TracesContext.Provider value={value}>{children}</TracesContext.Provider>;
};

export const useTraces = () => useContext(TracesContext);
