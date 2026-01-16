import { create } from "zustand";
import http from "../../config";
import { message } from "antd";
import { m } from "framer-motion";

const useReviewStore = create(() => ({
  postServiceRewiew: async (id : number , data : any) => {
    try {
      const response = await http.post(`/project/services/${id}/reviews/` , data);
      if (response.status === 200) {
        message.success("Review posted successfully!");
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  },
  

}));

export default useReviewStore;