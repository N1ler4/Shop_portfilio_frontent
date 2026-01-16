import { create } from "zustand";
import http from "../../config";
import { message } from "antd";

const useFmStore = create(() => ({
  getFMCategories: async () => {
    try {
      const response = await http.get("/project/fm-categories/");
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getFm : async (params = "") => {
    try {
      const url = `/project/fms/${params ? `?${params}` : ""}`;
      const response = await http.get(url);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  postFm: async (data: any) => {
    try {
      const response = await http.post("/project/fms/", data);
      if (response.status === 201) {
        message.success("FM created successfully");
        return response.data;
      }
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to create FM";
      message.error(errorMsg);
      console.error(error);
    }
  },
  likeFm: async (fmId: string) => {
    try {
      const response = await http.post(`/project/fm/${fmId}/like/`);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.message || "Failed to like FM";
      message.error(errorMsg);
      console.error(error);
    }
  }

}));

export default useFmStore;