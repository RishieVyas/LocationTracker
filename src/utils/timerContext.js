import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the context
const IntervalContext = createContext();

// This hook makes it easier to use the context
export const useInterval = () => useContext(IntervalContext);

// Provider component
export const IntervalProvider = ({ children }) => {
    const [count, setCount] = useState(0);
    const [counterStopped, setCounterStopped] = useState(false)
    const [intervalId, setIntervalId] = useState(null);
    const [tripDuration, setTripDuration] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);

    // Function to start the interval
    const startInterval = () => {
        setCounterStopped(false)
        // Prevent multiple intervals from starting
        if (!intervalId) {
            const id = setInterval(() => {
                setCount(prevCount => prevCount + 1); // Update count every second
            }, 1000);
            setIntervalId(id); // Save the interval ID for stopping it later
        }
    };

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setTimer((timer) => timer + 1);
            }, 1000);
            setTripDuration(timer);
        } else if (!isActive) {
            clearInterval(interval);
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    // Function to stop the interval
    const stopInterval = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setCounterStopped(true)
            setIntervalId(null); // Clear the interval ID
            setTripDuration(count);
            if (tripDuration > 0) {
                setCount(0);
            }
        }
    };

    // Cleanup the interval when the component unmounts
    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);



    return (
        <IntervalContext.Provider value={{ count, startInterval, stopInterval, counterStopped, setCount, tripDuration, isActive, setIsActive, timer }}>
            {children}
        </IntervalContext.Provider>
    );
};
