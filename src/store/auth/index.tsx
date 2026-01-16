// store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { message } from "antd";
import http from "../../config";
import {
  saveAccessToken,
  saveRefreshToken,
  removeToken,
} from "../../helper/auth-helper";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  is_phone_verified?: boolean; // ✅ Добавлено
  is_email_verified?: boolean; // ✅ Добавлено
  profile_image?: string;
  company_name?: string;
  total_sales?: number;
  total_income?: number;
  net_income?: number;
  active_anouncements?: number;
  rate?: number;
  registered_at?: string;
  reviews_count?: number;
}

interface GoogleAuthResponse {
  access: string;
  refresh: string;
  user: User;
  created: boolean;
}

// ✅ Новые интерфейсы для верификации
interface SignUpResponse {
  user_id: number;
  full_name: string;
  email?: string;
  phone_number?: string;
  requires_sms_verification?: boolean;
  requires_email_verification?: boolean;
}

interface VerificationResponse {
  message: string;
  access?: string;
  refresh?: string;
  user?: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  signIn: (credentials: {
    email_or_phone: string;
    password: string;
  }) => Promise<any>;
  signUp: (data: any) => Promise<SignUpResponse>; // ✅ Обновлено
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => void;
  showProfile: () => any;
  showUserStats: () => Promise<any>;
  showUserListings: () => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  refreshAccessToken: () => Promise<boolean>;

  // ✅ Новые методы для верификации
  verifyEmail: (payload: {
    email: string;
    code: string;
  }) => Promise<VerificationResponse>;
  verifySMS: (payload: {
    phone_number: string;
    code: string;
  }) => Promise<VerificationResponse>;
  resendEmail: (payload: { email: string }) => Promise<{ message: string }>;
  resendSMS: (payload: {
    phone_number: string;
  }) => Promise<{ message: string }>;
}

const GOOGLE_AUTH_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/user/auth/google/`
  : "http://127.0.0.1:8000/user/auth/google/";

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      signIn: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/token/`, credentials);
          if (response.status === 200) {
            const { access, refresh } = response.data;
            saveAccessToken(access);
            saveRefreshToken(refresh);

            set({
              accessToken: access,
              refreshToken: refresh,
              isAuthenticated: true,
              isLoading: false,
            });

            await get().showProfile();
            message.success("Успешный вход");
            return response;
          }
        } catch (error: any) {
          message.error("Ошибка входа");
          set({ isLoading: false });
          throw error;
        }
      },

      // ✅ Обновленный signUp для поддержки верификации
      signUp: async (data) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/auth/register/`, data);

          if (response.status === 201) {
            set({ isLoading: false });

            // Если не требуется верификация (обычно для email)
            if (response.data.access && response.data.refresh) {
              const { access, refresh } = response.data;
              saveAccessToken(access);
              saveRefreshToken(refresh);

              set({
                accessToken: access,
                refreshToken: refresh,
                isAuthenticated: true,
              });

              await get().showProfile();
              message.success("Регистрация прошла успешно");
            } else {
              // Требуется верификация - не показываем сообщение об успехе здесь
              console.log("Требуется верификация:", response.data);
            }

            return response.data;
          } else if (response.status === 400) {
            // Обработка ошибок валидации
            const errorMessage = "Такой номер или email уже зарегистрирован";
            message.error(errorMessage);
            set({ isLoading: false });
            throw new Error(errorMessage);
          }
        } catch (error: any) {
          set({ isLoading: false });

          // Более детальная обработка ошибок
          const errorMessage =
            error.response?.data?.email_or_phone ||
            error.response?.data?.error ||
            "Ошибка регистрации";

          message.error(errorMessage);
          throw error;
        }
      },

      // ✅ Новый метод для верификации email
      verifyEmail: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/auth/verify-email/`, payload);

          if (response.status === 200) {
            const data = response.data;

            // Если получили токены, авторизуем пользователя
            if (data.access && data.refresh) {
              saveAccessToken(data.access);
              saveRefreshToken(data.refresh);

              set({
                user: data.user,
                accessToken: data.access,
                refreshToken: data.refresh,
                isAuthenticated: true,
                isLoading: false,
              });

              message.success("Email подтвержден! Добро пожаловать!");
            } else {
              set({ isLoading: false });
              message.success(data.message || "Email подтвержден");
            }

            return data;
          }
        } catch (error: any) {
          set({ isLoading: false });

          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            "Ошибка подтверждения email";

          message.error(errorMessage);
          throw error;
        }
      },

      // ✅ Новый метод для верификации SMS
      verifySMS: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/auth/verify-sms/`, payload);

          if (response.status === 200) {
            const data = response.data;

            // Если получили токены, авторизуем пользователя
            if (data.access && data.refresh) {
              saveAccessToken(data.access);
              saveRefreshToken(data.refresh);

              set({
                user: data.user,
                accessToken: data.access,
                refreshToken: data.refresh,
                isAuthenticated: true,
                isLoading: false,
              });

              message.success("Номер подтвержден! Добро пожаловать!");
            } else {
              set({ isLoading: false });
              message.success(data.message || "Номер подтвержден");
            }

            return data;
          }
        } catch (error: any) {
          set({ isLoading: false });

          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            "Ошибка подтверждения SMS";

          message.error(errorMessage);
          throw error;
        }
      },

      // ✅ Новый метод для повторной отправки email
      resendEmail: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/auth/resend-email/`, payload);

          if (response.status === 200) {
            set({ isLoading: false });
            message.success("Код отправлен на email повторно");
            return response.data;
          }
        } catch (error: any) {
          set({ isLoading: false });

          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            "Ошибка отправки email";

          message.error(errorMessage);
          throw error;
        }
      },

      // ✅ Новый метод для повторной отправки SMS
      resendSMS: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await http.post(`/user/auth/resend-sms/`, payload);

          if (response.status === 200) {
            set({ isLoading: false });
            message.success("SMS код отправлен повторно");
            return response.data;
          }
        } catch (error: any) {
          set({ isLoading: false });

          // Обработка специфичных ошибок для SMS
          if (error.response?.status === 429) {
            const errorMessage =
              error.response?.data?.error ||
              "Слишком много попыток. Подождите немного.";
            message.warning(errorMessage);
          } else {
            const errorMessage =
              error.response?.data?.error ||
              error.response?.data?.detail ||
              "Ошибка отправки SMS";
            message.error(errorMessage);
          }

          throw error;
        }
      },

      signInWithGoogle: async (idToken: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch(GOOGLE_AUTH_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_token: idToken,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Ошибка авторизации через Google"
            );
          }

          const data: GoogleAuthResponse = await response.json();

          // Сохраняем токены
          saveAccessToken(data.access);
          saveRefreshToken(data.refresh);

          set({
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          // Показываем соответствующее сообщение
          if (data.created) {
            message.success("Добро пожаловать! Ваш аккаунт был создан.");
            message.info(
              "Пожалуйста, заполните свой профиль для лучшего опыта."
            );
          } else {
            message.success("Добро пожаловать обратно!");
          }
        } catch (error: any) {
          set({ isLoading: false });
          message.error(error.message || "Ошибка авторизации через Google");
          throw error;
        }
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
        removeToken();
        message.info("Вы вышли из аккаунта");
      },

      showProfile: async () => {
        try {
          const response = await http.get(`/user/profile/`);
          if (response.status === 200) {
            // ✅ Обновляем пользователя в store
            set({ user: response.data });
            return response.data;
          } else {
            console.error("Ошибка загрузки профиля", response.statusText);
          }
        } catch (error) {
          console.error("Ошибка загрузки профиля", error);
          // Не показываем ошибку пользователю, так как это может быть фоновая загрузка
        }
      },

      showUserStats: async () => {
        try {
          const response = await http.get(`/project/user/stats/`);
          if (response.status === 200) {
            return response;
          } else {
            console.error(
              "Ошибка загрузки статистики пользователя",
              response.statusText
            );
          }
        } catch (error) {
          console.error("Ошибка загрузки статистики пользователя", error);
          throw error;
        }
      },

      showUserListings: async () => {
        try {
          const response = await http.get(`/project/user/listings/`);
          if (response.status === 200) {
            return response;
          } else {
            console.error(
              "Ошибка загрузки объявлений пользователя",
              response.statusText
            );
          }
        } catch (error) {
          console.error("Ошибка загрузки объявлений пользователя", error);
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await http.put(`/user/profile/`, data);
          if (response.status === 200) {
            set({ user: response.data, isLoading: false });
            message.success("Профиль обновлен");
            return response.data;
          }
        } catch (error) {
          set({ isLoading: false });
          message.error("Не удалось обновить профиль");
          console.error(error);
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await http.post(`/user/token/refresh/`, {
            refresh: refreshToken,
          });

          if (response.status === 200) {
            const { access } = response.data;
            saveAccessToken(access);
            set({ accessToken: access });
            return true;
          } else {
            get().signOut();
            return false;
          }
        } catch (error) {
          console.error("Ошибка обновления токена:", error);
          get().signOut();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
