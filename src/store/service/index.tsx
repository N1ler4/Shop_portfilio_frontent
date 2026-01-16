import { create } from "zustand";
import http from "../../config";
import { message } from "antd";

// Интерфейсы для типизации
interface ServiceCategory {
  id: number;
  serv_category_name: string;
}

interface Service {
  likes: number;
  id?: string;
  serv_name: string;
  serv_price: string;
  serv_desc: string;
  serv_img: string;
  serv_location: string;
  serv_category_details: ServiceCategory; // Информация о категории при чтении
  serv_company?: string;
  serv_reviews?: any[];
  reviews_count?: number;
  user_img?: string;
  user_full_name?: string;
  user_registrated_date?: string;
  similar_services?: Service[];
  avg_rating?: number;
  company?: any;
}

interface ServiceStoreState {
  services: Service[];
  service: Service | null;
  categories: ServiceCategory[];
  likeService: (id: string) => Promise<{ success: boolean; error: string | null }>;
  loading: boolean;
  error: string | null;
  updateService: (id: string, data: FormData) => Promise<{ data: any | null; error: string | null ; status?: number ;}>;

  getServices: (params?: string) => Promise<{ data: Service[]; error: string | null }>;
  getServiceById: (id: string) => Promise<{
    user_registrated_date(user_registrated_date: any): import("react").SetStateAction<string>;
    similar_services: any[]; data: Service | null; error: string | null 
}>;
  postService: (data: FormData) => Promise<{ data: Service | null; error: string | null }>;
  deleteService: (id: string) => Promise<{ success: boolean; error: string | null ; status?: number}>;
  getServiceCategories: () => Promise<{ data: ServiceCategory[]; error: string | null }>;
}

const useServiceStore = create<ServiceStoreState>((set, get) => ({
  services: [],
  service: null,
  categories: [],
  loading: false,
  error: null,

  getServices: async (params = "") => {
    set({ loading: true, error: null });
    try {
      const url = `/project/services/${params ? `?${params}` : ""}`;
      console.log("Request URL:", url);
      const response = await http.get(url);
      if (response.status === 200) {
        set({ services: response.data, loading: false });
        return { data: response.data, error: null };
      }
      return { data: [], error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to fetch services";
      set({ error: errorMsg, loading: false });
      return { data: [], error: errorMsg };
    }
  },

  getServiceById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await http.get(`/project/services/${id}/`);
      if (response.status === 200) {
        const serviceData = response.data;
        set({ service: serviceData, loading: false });
        return {
          user_registrated_date: (date: any) => date,
          similar_services: serviceData.similar_services || [],
          data: serviceData,
          error: null,
        };
      }
      return {
        user_registrated_date: () => "",
        similar_services: [],
        data: null,
        error: "Unexpected response status",
      };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to fetch service";
      set({ error: errorMsg, loading: false });
      return {
        user_registrated_date: () => "",
        similar_services: [],
        data: null,
        error: errorMsg,
      };
    }
  },

  postService: async (data: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await http.post(`/project/services/`, data);
      if (response.status === 201) {
        message.success("Service created successfully!");
        return { data: response.data, error: null };
      }
      return { data: null, error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to create service";
      set({ error: errorMsg, loading: false });
      message.error(errorMsg);
      return { data: null, error: errorMsg };
    }
  },

  deleteService: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await http.delete(`/project/services/${id}/`);
      if (response.status === 204) {
        message.success("Service deleted successfully!");
        const updatedServices = get().services.filter((service) => service.id !== id);
        set({ services: updatedServices, loading: false });
        return { success: true, error: null };
      }
      return { success: false, error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to delete service";
      set({ error: errorMsg, loading: false });
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
  updateService: async (id: string, data: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await http.patch(`/project/services/${id}/`, data);
      if (response.status === 200) {
        message.success("Service updated successfully!");
        const updatedServices = get().services.map((service) =>
          service.id === id ? response.data : service
        );
        set({ services: updatedServices, loading: false });
        return { data: response.data, error: null };
      }
      return { data: null, error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to update service";
      set({ error: errorMsg, loading: false });
      message.error(errorMsg);
      return { data: null, error: errorMsg };
    }
  },
  getServiceCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await http.get(`/project/service-categories/`);
      if (response.status === 200) {
        set({ categories: response.data, loading: false });
        return { data: response.data, error: null };
      }
      return { data: [], error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to fetch categories";
      set({ error: errorMsg, loading: false });
      return { data: [], error: errorMsg };
    }
  },
  likeService: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await http.post(`/project/services/${id}/like-toggle/`);
      if (response.status === 200) {
        const updatedServices = get().services.map((service) =>
          service.id === id ? { ...service, likes: (service.likes || 0) + 1 } : service
        );
        set({ services: updatedServices, loading: false });
        return { success: true, error: null };
      }
      return { success: false, error: "Unexpected response status" };
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to like service";
      set({ error: errorMsg, loading: false });
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }
}));

export default useServiceStore;