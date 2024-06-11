const API_BASE_URL = "https://tracker.ritis.org/api/v1";
const token = "g30rd4n15c00l!";

export const fetchApi = async (endpoint, method, body) => {
    console.log("API URL: ", `${API_BASE_URL}${endpoint}`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const config = {
        method: method,
        headers: headers,
        body: (method == "GET" || method == "DELETE" )? null : JSON.stringify(body),
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error;
    }
};