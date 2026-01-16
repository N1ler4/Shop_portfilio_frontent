import { create } from "zustand";
import http from "../../config";
import { message } from "antd";

interface ChatStore {
  getConversations: () => Promise<any[]>;
  getMessages: (chatId: any) => Promise<any[]>;
  sendMessage: (id: any, data: any) => Promise<any>;
  markMessagesAsRead: (chatId: any) => Promise<any>;
  createChat: (participantId: any) => Promise<any>;
  deleteChat: (chatId: any) => Promise<boolean>;
  getUnreadCount: () => Promise<any>;
}

const useChatStore = create<ChatStore>((set) => ({
  getConversations: async () => {
    try {
      const response = await http.get(`/project/chats/`);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error; // Пробрасываем ошибку для обработки выше
    }
  },
  getMessages: async (chatId: any) => {
    try {
      const response = await http.get(`/project/messages/?chat=${chatId}`);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },
  sendMessage: async (id: any, data: any) => {
    try {
      const response = await http.post(`/project/chats/${id}/send_message/`, { content: data });
      if (response.status === 201) {
        return response.data;
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message.");
      throw error;
    }
  },
  markMessagesAsRead: async (chatId: any) => {
    try {
      const response = await http.post(`project/chats/${chatId}/mark_messages_as_read/`);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },
  createChat: async (participantId: any) => {
    try {
      const response = await http.post(`/project/chats/`, { participant_id: participantId });
      if (response.status === 201) {
        return response.data;
      }
      throw new Error(`Failed to create chat, status: ${response.status}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      if (error.response) {
      }
      throw error; // Пробрасываем ошибку для обработки выше
    }
  },
  deleteChat: async (chatId: any) => {
    try {
      const response = await http.delete(`/project/chats/${chatId}/`);
      if (response.status === 204) {
        return true;
      }
      throw new Error(`Failed to delete chat, status: ${response.status}`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      message.error("Failed to delete chat.");
      throw error; // Пробрасываем ошибку для обработки выше
  }},
  getUnreadCount: async () => {
    try {
      const response = await http.get(`/project/chats/unread_count/`);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error; // Пробрасываем ошибку для обработки выше
  }
}
}));

export default useChatStore;