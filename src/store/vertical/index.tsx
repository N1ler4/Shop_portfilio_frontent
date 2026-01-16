import http from "../../config";
import { create } from "zustand";
import { message } from "antd";
import { get } from "http";


const useVerticalStore = create(() => ({
    getVerticals: async (categories?: any) => {
        try {
            let url = "/project/verticals/";
            const queryParams = [];
            
            
            if (categories) {
                queryParams.push(`vr_category=${categories}`);
            }
            
            if (queryParams.length > 0) {
                url += "?" + queryParams.join("&");
            }
            
            const response = await http.get(url);
            return { data: response.data, error: null };
        } catch (error: any) {
            console.error("Error fetching verticals:", error);
            return { data: [], error: error?.response?.data?.detail || "Ошибка при получении вертикалей" };
        }
    },
    postVertical: async (data: any) => {
        try {
            const response = await http.post(`/project/verticals/`, data);
            if (response.status === 201) {
                message.success("Вертикаль успешно добавлена");
                return { data: response.data, error: null };
            }
            return { data: null, error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error posting vertical:", error);
            return { data: null, error: error?.response?.data?.detail || "Ошибка при добавлении вертикали" };
        }
    },
    getVerticalById: async (id: string) => {
        try {
            const response = await http.get(`/project/verticals/${id}/`);
            if (response.status === 200) {
                return { data: response.data, error: null };
            }
            return { data: null, error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error fetching vertical by ID:", error);
            return { data: null, error: error?.response?.data?.detail || "Ошибка при получении вертикали по ID" };
        }
    },
    updateVertical: async (id: string, data: any) => {
        try {
            const response = await http.put(`/project/verticals/${id}/`, data);
            if (response.status === 200) {
                message.success("Вертикаль успешно обновлена");
                return { data: response.data, error: null };
            }
            return { data: null, error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error updating vertical:", error);
            return { data: null, error: error?.response?.data?.detail || "Ошибка при обновлении вертикали" };
        }
    },
    deleteVertical: async (id: string) => {
        try {
            const response = await http.delete(`/project/verticals/${id}/`);
            if (response.status === 204) {
                message.success("Вертикаль успешно удалена");
                return { success: true, error: null };
            }
            return { success: false, error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error deleting vertical:", error);
            return { success: false, error: error?.response?.data?.detail || "Ошибка при удалении вертикали" };
        }
    },
    likeVertical: async (id: string) => {
        try {
            const response = await http.post(`/project/verticals/${id}/like/`);
            if (response.status === 201) {
                message.success("Вертикаль успешно лайкнута");
                return { data: response.data, error: null };
            }else if (response.status === 200) {
                message.success("Убранно из лайков");
                return { data: response.data, error: null };
            }
            return { data: null, error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error liking vertical:", error);
            return { data: null, error: error?.response?.data?.detail || "Ошибка при лайке вертикали" };
        }
    },
    getVerticalCategories: async () => {
        try {
            const response = await http.get(`/project/vertical-categories/`);
            if (response.status === 200) {
                return response;
            }
            return { data: [], error: "Unexpected response status" };
        } catch (error: any) {
            console.error("Error fetching vertical categories:", error);
            return { data: [], error: error?.response?.data?.detail || "Ошибка при получении категорий вертикалей" };
        }
    }
}));

export default useVerticalStore;