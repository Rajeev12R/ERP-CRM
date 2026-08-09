import api from "./api";

export const stockIn = async (data) => {
    const response = await api.post("/stock/in", data);
    return response.data;
};

export const stockOut = async (data) => {
    const response = await api.post("/stock/out", data);
    return response.data;
};

export const getStockMovements = async (params = {}) => {
    const response = await api.get("/stock/movements", { params });
    return response.data;
};

export const getLowStockProducts = async () => {
    const response = await api.get("/stock/low-stock");
    return response.data;
};
