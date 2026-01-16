import { create } from "zustand";
import http from "../../config";


const useAuctionStore = create(() => ({

  postAuction : async (data : any) => {
    try {
      const response = await http.post("/project/auctions/" , data);
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getAuctionCategory : async () => {
    try {
      const response = await http.get("/project/auction-categories/");
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getAuctions: async (params: { page?: number , auct_category?: number|string} = {}) => {
    try {
      const response = await http.get("/project/auctions/", {
        params: { page: params.page || 1 , auct_category: params.auct_category || null,},
        
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
      throw error; // Rethrow to handle in component
    }
  },
  getFeaturedAuctions: async () => {
    try {
      const response = await http.get("/project/auctions/get_featured_auctions/");
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getAuctionDetail : async (id : string) => {
    try {
      const response = await http.get(`/project/auctions/${id}/`);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  updateAuction: async (id: string, data: any) => {
    try {
      const response = await http.put(`/project/auctions/${id}/`, data);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },
  deleteAuction: async (id: string) => {
    try {
      const response = await http.delete(`/project/auctions/${id}/`);
      if (response.status === 204) {
        return true; // Успешное удаление
      }
    } catch (error) {
      console.error(error);
      throw error; // Rethrow to handle in component
    }
  },
  postBidAuction: async (data: any) => {
    try {
      const response = await http.post(`/project/auction-bids/`, data);
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
      throw error; // Rethrow to handle in component
  }},
}));

export default useAuctionStore;