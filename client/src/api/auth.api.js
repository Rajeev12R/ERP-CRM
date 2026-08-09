import api from "./api";

export const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

// Admin only
export const createUser = async (userData) => {
    const response = await api.post("/auth/users", userData);
    return response.data;
};
