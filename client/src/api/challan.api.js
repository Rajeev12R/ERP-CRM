import api from "./api";

export const getChallans = async (params = {}) => {
    const response = await api.get("/challans", { params });
    return response.data;
};

export const getChallanById = async (id) => {
    const response = await api.get(`/challans/${id}`);
    return response.data;
};

export const createChallan = async (data) => {
    const response = await api.post("/challans", data);
    return response.data;
};

export const confirmChallan = async (id) => {
    const response = await api.put(`/challans/${id}/confirm`);
    return response.data;
};

export const cancelChallan = async (id) => {
    const response = await api.put(`/challans/${id}/cancel`);
    return response.data;
};
