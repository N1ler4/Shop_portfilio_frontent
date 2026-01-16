import { create } from "zustand";
import http from "../../config";
import { message } from "antd";
import { get } from "http";



const useProductStore = create(() => ({
    getProducts: async () => {
        try {
            const response = await http.get(`/project/products/`);
            if (response.status === 200) {
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error; // Пробрасываем ошибку для обработки выше
        }
    },
    getProductDetails: async (id : any) => {
        try {
            const response = await http.get(`/project/products/${id}/`);
            if (response.status === 200) {
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error fetching product details:", error);
            throw error;
        }
    },
    postProduct: async (data: any) => {
        try {
            const response = await http.post(`/project/products/`, data);
            if (response.status === 201) {
                message.success("Product created successfully");
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error creating product:", error);
            message.error("Failed to create product.");
            throw error;
        }
    },
    deleteProduct: async (id: any) => {
        try {
            const response = await http.delete(`/project/products/${id}/`);
            if (response.status === 204) {
                message.success("Product deleted successfully");
                return true;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error deleting product:", error);
            message.error("Failed to delete product.");
            throw error;
        }
    },
    updateProduct: async (id: any, data: any) => {
        try {
            const response = await http.put(`/project/products/${id}/`, data);
            if (response.status === 200) {
                message.success("Product updated successfully");
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error updating product:", error);
            message.error("Failed to update product.");
            throw error;
        }
    },
    postReviewProduct: async (id : any , data: any) => {
        try {
            const response = await http.post(`/project/products/${id}/reviews/`, data);
            if (response.status === 201) {
                message.success("Review posted successfully");
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error posting review:", error);
            message.error("Failed to post review.");
            throw error;
    }},
    getProductCategories: async () => {
        try {
            const response = await http.get(`/project/categories/`);
            if (response.status === 200) {
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error fetching product categories:", error);
            throw error;
        }
    },
    likeProduct: async (id: any) => {
        try {
            const response = await http.post(`/project/products/${id}/like-toggle/`);
            if (response.status === 201) {
                message.success("Product liked successfully");
                return response.data;
            }
            else if (response.status === 200) {
                message.success("Product unliked successfully");
                return response.data;
            }
            throw new Error("Unexpected response status");
        } catch (error) {
            console.error("Error liking product:", error);
            message.error("Failed to like product.");
            throw error;
        }
    }
}))

export default useProductStore;