import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import useAuthStore from "../../store/auth";
import { message } from "antd";

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onRegisterClick: () => void;
}

// Используйте ваш реальный Client ID из Google Cloud Console
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "564694407501-ejk7moijafupn8vfliqfesa1lplukfhd.apps.googleusercontent.com";

const validationSchema = Yup.object().shape({
  email_or_phone: Yup.string().required("Телефон обязателен"),
  password: Yup.string()
    .required("Пароль обязателен")
    .min(6, "Минимум 6 символов"),
});

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onOpenChange,
  onRegisterClick,
}) => {
  const { signIn, signInWithGoogle } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Загрузка Google API с улучшенной обработкой ошибок
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("Google Client ID не найден в переменных окружения");
      return;
    }

    // Проверяем, не загружен ли уже скрипт
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (window.google && !existingScript) {
      initializeGoogleAuth();
      return;
    }

    if (existingScript && !window.google) {
      // Скрипт загружается, ждем
      existingScript.addEventListener('load', () => {
        setTimeout(initializeGoogleAuth, 200);
      });
      return;
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(initializeGoogleAuth, 200);
      };
      
      script.onerror = () => {
        message.error('Не удалось загрузить Google API');
      };
      
      document.head.appendChild(script);
    }
  }, []);

  const initializeGoogleAuth = () => {
    if (!window.google?.accounts?.id) {
      console.error('Google API не доступен');
      setTimeout(initializeGoogleAuth, 500); // Повторная попытка
      return;
    }

    try {
      
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Добавляем дополнительные настройки
        use_fedcm_for_prompt: false, // Отключаем FedCM для совместимости
        ux_mode: 'popup', // Принудительно используем popup
        context: 'signin',
      });
      
      setGoogleScriptLoaded(true);
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      message.error('Ошибка инициализации Google Auth');
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsGoogleLoading(true);
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      
      response = await signInWithGoogle(response.credential);
      if(response){
        message.success('Успешная авторизация через Google!', () => {
          onOpenChange();
        });
        window.location.reload();
      } 
    } catch (error) {
      console.error('Google auth error:', error);
      message.error('Ошибка авторизации через Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {    
    if (!GOOGLE_CLIENT_ID) {
      message.error('Google Client ID не настроен');
      return;
    }

    if (!googleScriptLoaded || !window.google?.accounts?.id) {
      message.error('Google API не загружен. Попробуйте перезагрузить страницу.');
      return;
    }

    setIsGoogleLoading(true);
    
    try {
      // Альтернативный подход - используем renderButton для большей надежности
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      
      window.google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        width: 200,
        // Кликаем программно
      });
      
      // Автоматически кликаем по кнопке
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          googleButton.click();
        } else {
          // Fallback к prompt методу
          window.google!.accounts.id.prompt((notification: any) => {
            
            if (notification.isNotDisplayed()) {
              setIsGoogleLoading(false);
              message.error('Всплывающие окна заблокированы. Разрешите всплывающие окна для этого сайта.');
            } else if (notification.isSkippedMoment()) {
              setIsGoogleLoading(false);
            }
          });
        }
        
        // Очищаем временный элемент
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 100);
      }, 100);
      
    } catch (error) {
      console.error('Google login error:', error);
      setIsGoogleLoading(false);
      message.error('Ошибка при вызове Google авторизации');
    }
  };

  const handleSubmit = async (values: { email_or_phone: string; password: string }) => {
    try {
      const response = await signIn(values);
      if (response?.status === 200) {
        onOpenChange();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      classNames={{
        base: "bg-content1/80 backdrop-blur-md border border-content2",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Вход в аккаунт
            </ModalHeader>
            <Formik
              initialValues={{
                email_or_phone: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
              }) => (
                <Form>
                  <ModalBody>
                    <Input
                      name="email_or_phone"
                      label="Номер телефона"
                      placeholder="Введите номер телефона"
                      variant="bordered"
                      value={values.email_or_phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email_or_phone && !!errors.email_or_phone}
                      errorMessage={
                        touched.email_or_phone &&
                        typeof errors.email_or_phone === "string"
                          ? errors.email_or_phone
                          : undefined
                      }
                    />
                    <Input
                      name="password"
                      label="Пароль"
                      placeholder="Введите пароль"
                      type={showPassword ? "text" : "password"}
                      variant="bordered"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && !!errors.password}
                      errorMessage={
                        touched.password &&
                        typeof errors.password === "string"
                          ? errors.password
                          : undefined
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="focus:outline-none"
                          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        >
                          <Icon
                            icon={showPassword ? "lucide:eye-off" : "lucide:eye"}
                            className="text-default-400"
                          />
                        </button>
                      }
                    />
                    <div className="flex justify-end items-center">
                      <Link color="primary" href="#" size="sm">
                        Забыли пароль?
                      </Link>
                    </div>

                    <Divider className="my-2" />

                    <div className="flex flex-col gap-2">
                      <Button
                        color="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        className="w-full"
                      >
                        Войти
                      </Button>

                      <div className="flex items-center gap-4 my-2">
                        <Divider className="flex-1" />
                        <span className="text-default-500 text-sm">или</span>
                        <Divider className="flex-1" />
                      </div>

                      <Button
                        variant="bordered"
                        startContent={<Icon icon="logos:google-icon" />}
                        className="w-full"
                        isLoading={isGoogleLoading}
                        isDisabled={!googleScriptLoaded || !GOOGLE_CLIENT_ID}
                        onPress={handleGoogleLogin}
                      >
                        {isGoogleLoading ? "Авторизация..." : "Войти через Google"}
                      </Button>

                      <Button
                        variant="bordered"
                        startContent={<Icon icon="logos:telegram" />}
                        className="w-full"
                        isDisabled
                      >
                        Войти через Telegram
                      </Button>
                    </div>
                  </ModalBody>
                  <ModalFooter className="flex flex-col items-center">
                    <p className="text-center text-default-500 text-sm">
                      Нет аккаунта?{" "}
                      <Link
                        color="primary"
                        onPress={() => {
                          onClose();
                          onRegisterClick();
                        }}
                      >
                        Зарегистрироваться
                      </Link>
                    </p>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};