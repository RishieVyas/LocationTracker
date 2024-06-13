const useValidatedInput = (initialValue) => {
    let nameRegex = /^[a-zA-Z\s\-']+$/;
    const cleanedValue = initialValue.replace(/^\s+|\s+$/g, '').replace(/\s\s+/g, ' ');
    if (nameRegex.test(cleanedValue)) {
        return cleanedValue;
    } else {
        return cleanedValue.replace(/[`~0-9!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }
};

const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters from the input
    const digits = phoneNumber.replace(/\D/g, '');

    // Slice the string to match the desired format and add necessary characters
    const areaCode = digits.slice(0, 3);
    const middle = digits.slice(3, 6);
    const last = digits.slice(6, 10);

    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${areaCode}) ${middle}`;
    if (digits.length > 10) return digits;
    return `(${areaCode})-${middle}-${last}`;
};

const cleanPhoneNumber = (formattedNumber) => {
    return formattedNumber.replace(/[^\d]/g, '');
};

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1 and pad with leading zero if necessary
    const day = String(date.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0'); // Pad with leading zero if necessary
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Pad with leading zero if necessary
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Pad with leading zero if necessary
    return `${hours}:${minutes}:${seconds}`;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const calculateTotalDistance = (data) => {
    let totalDistance = 0;

    for (let i = 1; i < data.length; i++) {
        const { lat: lat1, lng: lng1 } = data[i - 1];
        const { lat: lat2, lng: lng2 } = data[i];

        totalDistance += haversineDistance(lat1, lng1, lat2, lng2);
    }

    return totalDistance; // Total distance in meters
};

const calculateAverageSpeed = (data) => {
    const totalSpeed = data.reduce((acc, curr) => acc + curr, 0);
    return totalSpeed / data.length; // Average speed
};

const getCurrentDate = () => {
    const date = new Date(); // gets the current date
    const month = date.getMonth() + 1; // getMonth() returns month from 0-11 (Jan is 0)
    const day = date.getDate(); // returns day of the month
    const year = date.getFullYear(); // returns the year

    // Format the date into MM/DD/YYYY
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
};

const formatTimer = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes} : ${getSeconds}`;
};


export { useValidatedInput, formatPhoneNumber, cleanPhoneNumber, formatTimestamp, formatTime, calculateTotalDistance, calculateAverageSpeed, getCurrentDate, formatTimer };