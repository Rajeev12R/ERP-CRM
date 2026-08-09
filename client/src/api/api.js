import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://erp-crm-ds1i.onrender.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Response interceptor to handle global errors (like 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only clear auth and redirect if it's not the login endpoint itself
            if (!error.config.url.includes('/auth/login')) {
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
