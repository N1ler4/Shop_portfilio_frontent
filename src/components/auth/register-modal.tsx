import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
  Checkbox,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import useAuthStore from "../../store/auth";

interface RegisterModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onLoginClick: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onOpenChange,
  onLoginClick,
}) => {
  const { signUp, verifyEmail, verifySMS, resendEmail, resendSMS, isLoading } = useAuthStore();

  const [step, setStep] = useState<'register' | 'verify-email' | 'verify-sms' | 'success'>('register');
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'sms'>('email');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Таймер для повторной отправки
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((step === 'verify-email' || step === 'verify-sms') && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Определение типа ввода (email или телефон)
  const isPhoneNumber = (input: string) => {
    const phonePattern = /^\+?998[\d\s\-\(\)]{9,}$/;
    return phonePattern.test(input.replace(/\s/g, ''));
  };

  const isEmail = (input: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('998')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
    return phone;
  };

  const handleRegister = async () => {
    // Используем isLoading из store вместо локального loading
    if (isLoading) return;
    
    setMessage("");

    if (!emailOrPhone || !password || !confirmPassword || !fullName) {
      setMessage("Пожалуйста, заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Пароли не совпадают");
      return;
    }

    if (!agreeTerms) {
      setMessage("Вы должны согласиться с условиями");
      return;
    }

    // Валидация email/phone
    if (!isEmail(emailOrPhone) && !isPhoneNumber(emailOrPhone)) {
      setMessage("Введите корректный email или номер телефона");
      return;
    }

    try {
      const payload = {
        full_name: fullName,
        email_or_phone: emailOrPhone,
        password,
        confirm_password: confirmPassword,
      };

      const response = await signUp(payload);

      // Проверяем, требуется ли верификация
      if (response.requires_sms_verification) {
        setVerificationType('sms');
        setStep("verify-sms");
        setTimer(60);
        setCanResend(false);
        setMessage("SMS код отправлен на ваш номер");
        setTimeout(() => setMessage(""), 3000);
      } else if (response.requires_email_verification) {
        setVerificationType('email');
        setStep("verify-email");
        setTimer(60);
        setCanResend(false);
        setMessage("Код подтверждения отправлен на email");
        setTimeout(() => setMessage(""), 3000);
      } else {
        // Пользователь уже авторизован (например, email регистрация без верификации)
        setStep("success");
        setTimeout(() => {
          onOpenChange();
          resetForm();
        }, 2000);
      }
    } catch (error: any) {
      // Ошибки уже обрабатываются в store через message.error()
      console.error("Registration error:", error);
    }
  };

  // Обработка ввода SMS кода
  const handleSmsCodeChange = (value: string, index: number) => {
    const newCode = [...smsCode];
    newCode[index] = value.replace(/[^0-9]/g, '');
    setSmsCode(newCode);

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerification(newCode.join(''));
    }
  };

  // Обработка клавиш для SMS кода
  const handleSmsCodeKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Обработка вставки кода
  const handleSmsCodePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setSmsCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Автоматическая проверка после вставки
      setTimeout(() => handleVerification(pastedData), 100);
    }
  };

  const handleVerification = async (code?: string) => {
    if (isLoading) return;
    
    setMessage("");

    try {
      let response;

      if (verificationType === 'sms') {
        const codeToVerify = code || smsCode.join('');
        
        if (codeToVerify.length !== 6) {
          setMessage("Введите код из 6 цифр");
          return;
        }

        response = await verifySMS({
          phone_number: emailOrPhone,
          code: codeToVerify
        });
      } else {
        if (!emailCode) {
          setMessage("Введите код из email");
          return;
        }

        response = await verifyEmail({
          email: emailOrPhone,
          code: emailCode
        });
      }

      // Если верификация успешна, пользователь автоматически авторизован
      if (response?.message) {
        setStep("success");
        setTimeout(() => {
          onOpenChange();
          resetForm();
        }, 2000);
      }
    } catch (error: any) {
      // Ошибки уже обрабатываются в store
      if (verificationType === 'sms') {
        setSmsCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setEmailCode("");
      }
    }
  };

  const handleResend = async () => {
    if (isLoading) return;
    
    setMessage("");
    
    try {
      if (verificationType === 'sms') {
        await resendSMS({ phone_number: emailOrPhone });
        setSmsCode(["", "", "", "", "", ""]);
      } else {
        await resendEmail({ email: emailOrPhone });
        setEmailCode("");
      }

      // Успешные сообщения показываются в store
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      // Ошибки уже обрабатываются в store
      console.error("Resend error:", error);
    }
  };

  const resetForm = () => {
    setStep('register');
    setFullName("");
    setEmailOrPhone("");
    setPassword("");
    setConfirmPassword("");
    setEmailCode("");
    setSmsCode(["", "", "", "", "", ""]);
    setMessage("");
    setAgreeTerms(false);
    setTimer(60);
    setCanResend(false);
    setVerificationType('email');
  };

  const handleClose = () => {
    onOpenChange();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
      placement="center"
      classNames={{
        base: "bg-content1/80 backdrop-blur-md border border-content2",
      }}
      size="lg"
      isDismissable={step === 'register'}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {step === 'register' && 'Регистрация'}
              {step === 'verify-email' && 'Подтверждение email'}
              {step === 'verify-sms' && 'Подтверждение номера'}
              {step === 'success' && 'Успешно!'}
            </ModalHeader>
            
            <ModalBody>
              {step === "register" && (
                <>
                  <Input
                    autoFocus
                    label="Полное имя"
                    placeholder="Введите ваше имя"
                    variant="bordered"
                    value={fullName}
                    onValueChange={setFullName}
                  />
                  <Input
                    label="Email или номер телефона"
                    placeholder="example@mail.ru или +998 90 123 45 67"
                    variant="bordered"
                    value={emailOrPhone}
                    onValueChange={(value) => {
                      if (isPhoneNumber(value)) {
                        setEmailOrPhone(formatPhoneNumber(value));
                      } else {
                        setEmailOrPhone(value);
                      }
                    }}
                    type="text"
                    autoComplete="username"
                  />
                  <Input
                    label="Пароль"
                    placeholder="Создайте пароль"
                    type="password"
                    variant="bordered"
                    value={password}
                    onValueChange={setPassword}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Повторите пароль"
                    placeholder="Повторите пароль"
                    type="password"
                    variant="bordered"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    autoComplete="new-password"
                  />
                  <Checkbox
                    isSelected={agreeTerms}
                    onValueChange={setAgreeTerms}
                  >
                    Я согласен с{" "}
                    <Link href="#" color="primary">
                      условиями использования
                    </Link>{" "}
                    и{" "}
                    <Link href="#" color="primary">
                      политикой конфиденциальности
                    </Link>
                  </Checkbox>
                  <Divider className="my-2" />
                    <Button
                      color="primary"
                      isLoading={isLoading}
                      onPress={handleRegister}
                      className="w-full"
                      isDisabled={!agreeTerms}
                    >
                      Зарегистрироваться
                    </Button>
                </>
              )}

              {step === "verify-email" && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-default-600">
                      Мы отправили код подтверждения на
                    </p>
                    <p className="font-semibold text-primary">
                      {emailOrPhone}
                    </p>
                    <p className="text-small text-default-500 mt-2">
                      Проверьте папку "Спам", если письмо не пришло
                    </p>
                  </div>

                  <Input
                    label="Код из email"
                    placeholder="Введите код из письма"
                    variant="bordered"
                    value={emailCode}
                    onValueChange={setEmailCode}
                    className="mb-4"
                  />

                  <div className="text-center mb-4">
                    {!canResend ? (
                      <p className="text-default-500">
                        Отправить код повторно через{" "}
                        <span className="font-bold text-primary">{timer}</span> сек
                      </p>
                    ) : (
                      <Button
                        variant="light"
                        color="primary"
                        onPress={handleResend}
                        isLoading={isLoading}
                      >
                        Отправить код повторно
                      </Button>
                    )}
                  </div>

                  <Button
                    color="primary"
                    onPress={() => handleVerification()}
                    isLoading={isLoading}
                    isDisabled={!emailCode}
                    className="w-full"
                  >
                    Подтвердить
                  </Button>
                </>
              )}

              {step === "verify-sms" && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-default-600">
                      Введите код из SMS, отправленного на номер
                    </p>
                    <p className="font-semibold text-primary">
                      {formatPhoneNumber(emailOrPhone)}
                    </p>
                    <p className="text-small text-default-500 mt-2">
                      Код придет в течение 1-2 минут
                    </p>
                  </div>

                  <Card className="mb-4">
                    <CardBody>
                      <div className="flex justify-center gap-2">
                        {smsCode.map((digit, index) => (
                          <Input
                            key={index}
                            ref={(el) => inputRefs.current[index] = el}
                            value={digit}
                            onChange={(e) => handleSmsCodeChange(e.target.value, index)}
                            onKeyDown={(e) => handleSmsCodeKeyDown(e, index)}
                            onPaste={(e) => handleSmsCodePaste(e, index)}
                            className="w-12"
                            classNames={{
                              input: "text-center text-lg font-bold",
                              inputWrapper: "h-12"
                            }}
                            maxLength={1}
                            variant="bordered"
                          />
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <div className="text-center mb-4">
                    {!canResend ? (
                      <p className="text-default-500">
                        Отправить код повторно через{" "}
                        <span className="font-bold text-primary">{timer}</span> сек
                      </p>
                    ) : (
                      <Button
                        variant="light"
                        color="primary"
                        onPress={handleResend}
                        isLoading={loading}
                      >
                        Отправить код повторно
                      </Button>
                    )}
                  </div>

                  <Button
                    color="primary"
                    onPress={() => handleVerification()}
                    isLoading={loading}
                    isDisabled={smsCode.some(digit => !digit)}
                    className="w-full"
                  >
                    Подтвердить
                  </Button>
                </>
              )}

              {step === "success" && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-success-600 text-lg font-semibold">
                    {verificationType === 'sms' 
                      ? "Номер телефона подтвержден!" 
                      : "Email подтвержден!"
                    }
                  </p>
                  <p className="text-default-500 mt-2">
                    Теперь вы можете войти в систему
                  </p>
                </div>
              )}

              {message && step !== "success" && (
                <p className={`mt-2 text-center ${
                  message.includes("отправлен") ? "text-success-500" : "text-danger-500"
                }`}>
                  {message}
                </p>
              )}
            </ModalBody>

            <ModalFooter className="flex flex-col items-center">
              {step === 'register' && (
                <p className="text-center text-default-500 text-sm">
                  Уже есть аккаунт?{" "}
                  <Link
                    color="primary"
                    onPress={() => {
                      onClose();
                      onLoginClick();
                    }}
                  >
                    Войти
                  </Link>
                </p>
              )}
              
              {(step === 'verify-sms' || step === 'verify-email') && (
                <Button
                  variant="light"
                  onPress={() => setStep('register')}
                  className="text-default-500"
                >
                  ← Назад к регистрации
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};