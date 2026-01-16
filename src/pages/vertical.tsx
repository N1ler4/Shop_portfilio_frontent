import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Avatar,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  useDisclosure,
  Input,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useVerticalStore from "../store/vertical";
import { message } from "antd";
import useChatStore from "../store/message";
import useAuthStore from "../store/auth";
import useAuth from "../helper/is_auth";
import { use } from "framer-motion/client";

interface VerticalCategory {
  id: string;
  vr_category_name: string;
}

interface VerticalAd {
  id: string;
  vr_name: string;
  vr_price: number;
  vr_desc: string;
  vr_category: string | VerticalCategory;
  vr_category_details?: VerticalCategory;
  seller: string;
  seller_info: {
    id: string;
    full_name: string;
    profile_image: string | null;
  };
  is_liked: boolean;
  vr_img: string | null;
}

const VerticalPage: React.FC = () => {
  const {
    getVerticalCategories,
    getVerticals,
    postVertical,
    likeVertical,
    updateVertical,
    deleteVertical,
  } = useVerticalStore();

  const [verticals, setVerticals] = useState<VerticalAd[]>([]);
  const [categories, setCategories] = useState<VerticalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [likingInProgress, setLikingInProgress] = useState<Set<string>>(
    new Set()
  );
  const [chats, setChats] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMsg, setRequestMsg] = useState("");
  const { sendMessage, getConversations, createChat } = useChatStore();
  const { showProfile } = useAuthStore();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await showProfile();
      if (response) {
        setUser(response);
      }
    };
    if (isLoggedIn) {
      fetchUserInfo();
    } else {
      setUser(null);
    }
  }, [showProfile]);

  useEffect(() => {
    const fetchConversations = async () => {
      const response = await getConversations();
      setChats(response);
    };
    fetchConversations();
  }, [getConversations]);

  const handleSendMessage = async (
    messageText: string,
    onClose: () => void
  ) => {
    if (!isLoggedIn) {
      message.error("Вы должны быть авторизованы для отправки сообщений");
      return;
    }

    if (!messageText.trim()) {
      message.error("Сообщение не может быть пустым");
      return;
    }

    try {
      const fetchConversationsData = async () => {
        try {
          const response = await getConversations();
          setChats(response || []);
        } catch (error) {
          console.error("Error fetching updated conversations:", error);
        }
      };
      await fetchConversationsData();

      const sellerId = currentAd?.seller_info?.id;
      const existingChats = chats.filter(
        (chat: any) => chat.companion_id == sellerId
      );
      const existingChat = existingChats[0];

      let chatId: any;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        console.log(
          "No chat found, attempting to create new with sellerId:",
          sellerId
        );
        const chatResponse = await createChat(sellerId);
        if (chatResponse && chatResponse.id) {
          chatId = chatResponse.id;
          setChats((prev) => [...prev, chatResponse]);
        } else {
          throw new Error("Failed to create chat");
        }
      }

      const messageData = `${messageText}`;
      await sendMessage(chatId, messageData);

      setShowRequestModal(false);
      setRequestMsg("");
      message.success("Сообщение успешно отправлено");
      onClose();
    } catch (error) {
      console.error("Error in request process:", error);
      if (error.response) {
        console.log("Error details:", error.response.data);
      }
      message.error("Не удалось отправить запрос. Попробуйте еще раз.");
    }
  };

  // Загружаем категории при монтировании
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await getVerticalCategories();

        if (categoriesResponse?.data?.data) {
          setCategories(
            Array.isArray(categoriesResponse.data.data)
              ? categoriesResponse.data.data
              : []
          );
        } else if (categoriesResponse?.data) {
          setCategories(
            Array.isArray(categoriesResponse.data)
              ? categoriesResponse.data
              : []
          );
        } else if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        }
      } catch (err) {
        console.error("Ошибка при загрузке категорий:", err);
      }
    };

    fetchCategories();
  }, [getVerticalCategories]);

  // Загружаем вертикали при изменении категории
  useEffect(() => {
    const fetchVerticals = async () => {
      setLoading(true);
      setError(null);

      try {

        // Загружаем вертикали с учетом выбранной категории
        const categoryId =
          selectedCategory !== "all" ? selectedCategory : undefined;
        const verticalsResponse = await getVerticals(categoryId);

        if (verticalsResponse?.data) {
          // Проверяем, является ли data массивом или объектом с results
          const verticalsData = Array.isArray(verticalsResponse.data)
            ? verticalsResponse.data
            : verticalsResponse.data.results || [];

          setVerticals(verticalsData);
          // Сбрасываем индекс при получении новых данных
          setCurrentAdIndex(0);
        } else if (verticalsResponse?.error) {
          setError(verticalsResponse.error);
        }
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Произошла ошибка при загрузке данных");
        message.error("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchVerticals();
  }, [selectedCategory, getVerticals]);

  // Удаляем старую фильтрацию, так как теперь загружаем с сервера
  const filteredVerticals = verticals;

  // Сброс индекса при изменении фильтра
  useEffect(() => {
    setCurrentAdIndex(0);
  }, [selectedCategory]);

  const handleSwipe = (direction: "up" | "down") => {
    if (filteredVerticals.length === 0) return;

    if (direction === "up") {
      setCurrentAdIndex(
        (prevIndex) => (prevIndex + 1) % filteredVerticals.length
      );
    } else {
      setCurrentAdIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredVerticals.length) % filteredVerticals.length
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;
    if (isUpSwipe) {
      handleSwipe("up");
    } else if (isDownSwipe) {
      handleSwipe("down");
    }
  };

  // Функция для загрузки следующей страницы
  // const loadMoreVerticals = async () => {
  //   if (loadingMore || !hasMore) return;

  //   setLoadingMore(true);
  //   try {
  //     const categoryParam = selectedCategory !== "all" ? selectedCategory : undefined;
  //     const verticalsResponse = await getVerticals(categoryParam);

  //     if (verticalsResponse?.data && verticalsResponse.data.length > 0) {
  //       setVerticals(prev => [...prev, ...verticalsResponse.data]);
  //     } else {
  //       setHasMore(false);
  //     }
  //   } catch (err) {
  //     console.error('Ошибка при загрузке дополнительных данных:', err);
  //   } finally {
  //     setLoadingMore(false);
  //   }
  // };

  // Проверяем, нужно ли загрузить больше данных
  // useEffect(() => {
  //   if (currentAdIndex >= filteredVerticals.length - 2 && hasMore && !loadingMore) {
  //     loadMoreVerticals();
  //   }
  // }, [currentAdIndex, filteredVerticals.length]);

  const handleLike = async (verticalId: string) => {
    // Предотвращаем множественные клики
    if (likingInProgress.has(verticalId)) return;

    try {
      // Добавляем ID в обработку
      setLikingInProgress((prev) => new Set(prev).add(verticalId));

      // Находим текущее состояние лайка
      const currentVertical = verticals.find((v) => v.id === verticalId);
      const wasLiked = currentVertical?.is_liked || false;

      // Оптимистично обновляем UI
      setVerticals((prevVerticals) =>
        prevVerticals.map((v) =>
          v.id === verticalId ? { ...v, is_liked: !wasLiked } : v
        )
      );

      const response = await likeVertical(verticalId);

      if (response.error) {
        // Откатываем изменения при ошибке
        setVerticals((prevVerticals) =>
          prevVerticals.map((v) =>
            v.id === verticalId ? { ...v, is_liked: wasLiked } : v
          )
        );
        message.error(response.error);
      } else {
        // Показываем соответствующее сообщение
        if (response.data?.message === "Liked") {
          message.success("Добавлено в избранное");
        } else if (response.data?.message === "Unliked") {
          message.success("Удалено из избранного");
        }
      }
    } catch (error) {
      message.error("Ошибка при обновлении избранного");
      console.error("Like error:", error);
    } finally {
      // Удаляем ID из обработки
      setLikingInProgress((prev) => {
        const newSet = new Set(prev);
        newSet.delete(verticalId);
        return newSet;
      });
    }
  };

  const handleShare = (ad: VerticalAd) => {
    const shareUrl = `${window.location.origin}/vertical/${ad.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: ad.vr_name,
          text: ad.vr_desc,
          url: shareUrl,
        })
        .catch(() => {
          // Пользователь отменил шаринг
        });
    } else {
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(shareUrl);
      message.success("Ссылка скопирована в буфер обмена");
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const categoryId =
        selectedCategory !== "all" ? selectedCategory : undefined;
      const verticalsResponse = await getVerticals(categoryId);
      if (verticalsResponse.data) {
        // Проверяем, является ли data массивом или объектом с results
        const verticalsData = Array.isArray(verticalsResponse.data)
          ? verticalsResponse.data
          : verticalsResponse.data.results || [];

        setVerticals(verticalsData);
        setError(null);
      } else if (verticalsResponse.error) {
        setError(verticalsResponse.error);
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="white" />
          <p className="text-white mt-4">Загрузка объявлений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <Icon
            icon="lucide:alert-circle"
            className="mx-auto mb-4"
            width={48}
            height={48}
          />
          <p className="text-lg mb-2">Произошла ошибка при загрузке данных</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <Button
            color="primary"
            variant="flat"
            className="mt-4"
            onPress={refreshData}
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (filteredVerticals.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <Icon
            icon="lucide:package-x"
            className="mx-auto mb-4"
            width={48}
            height={48}
          />
          <p className="text-lg">
            {selectedCategory === "all"
              ? "Нет доступных объявлений"
              : "В этой категории пока нет объявлений"}
          </p>
          {selectedCategory !== "all" && (
            <Button
              color="primary"
              variant="flat"
              className="mt-4"
              onPress={() => setSelectedCategory("all")}
            >
              Показать все объявления
            </Button>
          )}
          <Link to="/">
            <Button color="default" variant="flat" className="mt-2">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentAd =
    filteredVerticals[Math.min(currentAdIndex, filteredVerticals.length - 1)];

  // Безопасная проверка текущего объявления
  if (!currentAd) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <Spinner size="lg" color="white" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden flex justify-center items-center"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-[260px] h-[85vh] mb-4 mx-6 z-40 fixed left-0 right-auto bottom-0">
        <h3 className="text-white font-semibold text-lg mb-2 px-2">
          Категории
        </h3>
        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-sm font-medium
              ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20"
                  : "hover:bg-white/5 text-gray-300 hover:text-white"
              }
            `}
          >
            <Icon
              icon="solar:widget-2-bold-duotone"
              width={20}
              height={20}
              className={
                selectedCategory === "all" ? "text-blue-400" : "text-gray-400"
              }
            />
            <span>Все категории</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-sm font-medium
                ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20"
                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                }
              `}
            >
              <Icon
                icon="solar:folder-bold-duotone"
                width={20}
                height={20}
                className={
                  selectedCategory === category.id
                    ? "text-blue-400"
                    : "text-gray-400"
                }
              />
              <span>{category.vr_category_name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-row items-center lg:items-end w-full max-w-full justify-center lg:mt-20 h-[80%]">
        {/* Блок с описанием */}
        <div className="hidden lg:flex flex-col justify-end min-w-[300px] max-w-[350px] h-[80vh] pb-0">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">
                {typeof currentAd?.vr_category_details?.vr_category_name ===
                "string"
                  ? currentAd.vr_category_details.vr_category_name
                  : "Категория"}
              </span>
            </div>

            <h2 className="text-white text-2xl font-bold mb-3 line-clamp-2">
              {currentAd?.vr_name || "Без названия"}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {(currentAd?.vr_price || 0).toLocaleString("ru-RU")}
              </span>
              <span className="text-gray-400 text-lg">₽</span>
            </div>

            <p className="text-gray-300 text-sm mb-6 line-clamp-3">
              {currentAd?.vr_desc || "Описание отсутствует"}
            </p>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    currentAd?.seller_info?.profile_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentAd?.seller_info?.full_name || "User"
                    )}&background=6366f1&color=fff`
                  }
                  alt={currentAd?.seller_info?.full_name || "User"}
                  className="w-12 h-12 ring-2 ring-white/20"
                />
                <div>
                  <p className="text-white font-medium">
                    {currentAd?.seller_info?.full_name || "Продавец"}
                  </p>
                  <p className="text-gray-400 text-xs">Активный продавец</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Объявление (Фото/видео) */}
        <div
          className="flex flex-col items-center justify-center w-full lg:w-full lg:h-screen lg:max-w-[330px] mx-auto lg:mx-0 lg:bg-transparent lg:rounded-2xl lg:shadow-2xl"
          onWheel={(e) => {
            if (window.innerWidth >= 1024) {
              if (e.deltaY > 0) handleSwipe("up");
              else if (e.deltaY < 0) handleSwipe("down");
            }
          }}
          style={{
            height: window.innerWidth >= 1024 ? "80vh" : "100dvh",
          }}
        >
          {/* Exit button */}
          <div className="hidden lg:block absolute top-4 right-4 z-40">
            <Link to="/">
              <Button
                isIconOnly
                variant="flat"
                className="bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 shadow-xl rounded-xl w-12 h-12 flex items-center justify-center transition-all"
              >
                <Icon
                  icon="solar:close-circle-line-duotone"
                  className="text-white"
                  width={24}
                  height={24}
                />
              </Button>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd.id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full lg:aspect-[9/13.68] max-w-full lg:max-w-[330px] mx-auto relative flex justify-center items-center"
            >
              {currentAd?.vr_img ? (
                <img
                  src={currentAd.vr_img}
                  alt={currentAd?.vr_name || "Изображение"}
                  className="w-full h-full object-cover lg:rounded-2xl lg:shadow-2xl absolute inset-0 z-10 bg-black"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/330x462?text=${encodeURIComponent(
                      currentAd?.vr_name || "Изображение"
                    )}`;
                  }}
                />
              ) : (
                <div className="w-full h-full lg:rounded-2xl lg:shadow-2xl absolute inset-0 z-10 bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      icon="lucide:image"
                      className="mx-auto text-gray-600 mb-2"
                      width={48}
                      height={48}
                    />
                    <p className="text-gray-500 text-sm">
                      {currentAd?.vr_name || "Нет изображения"}
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 rounded-2xl" />

              {/* Mobile bottom info */}
              <div className="absolute bottom-0 left-0 w-full px-4 pb-6 z-20 lg:hidden">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-xs font-medium">
                      {typeof currentAd?.vr_category_details
                        ?.vr_category_name === "string"
                        ? currentAd.vr_category_details.vr_category_name
                        : "Категория"}
                    </span>
                  </div>

                  <h2 className="text-white text-xl font-bold mb-2 line-clamp-1">
                    {currentAd?.vr_name || "Без названия"}
                  </h2>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-white">
                      {(currentAd?.vr_price || 0).toLocaleString("ru-RU")}
                    </span>
                    <span className="text-gray-400">$</span>
                  </div>

                  <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                    {currentAd?.vr_desc || "Описание отсутствует"}
                  </p>

                  <div className="flex items-center gap-2">
                    <Avatar
                      src={
                        `http://localhost:8000/${currentAd?.seller_info?.profile_image}` ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentAd?.seller_info?.full_name || "User"
                        )}&background=6366f1&color=fff`
                      }
                      alt={currentAd?.seller_info?.full_name || "User"}
                      className="w-8 h-8 ring-2 ring-white/20"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {currentAd?.seller_info?.full_name || "Продавец"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile action buttons */}
              <div className="flex flex-col gap-3 z-30 absolute top-1/2 right-4 -translate-y-1/2 items-center lg:hidden">
                <Button
                  isIconOnly
                  variant="flat"
                  className={`shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all duration-200 border ${
                    currentAd?.is_liked
                      ? "bg-red-500/80 hover:bg-red-600/80 border-red-400/50"
                      : "bg-black/40 backdrop-blur-md hover:bg-black/50 border-white/10"
                  }`}
                  onPress={() => currentAd && handleLike(currentAd.id)}
                  disabled={
                    !currentAd || likingInProgress.has(currentAd?.id || "")
                  }
                >
                  {likingInProgress.has(currentAd?.id || "") ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <Icon
                      icon={
                        currentAd?.is_liked
                          ? "solar:heart-bold"
                          : "solar:heart-linear"
                      }
                      className="text-white"
                      width={28}
                      height={28}
                    />
                  )}
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all"
                  onPress={onOpen}
                >
                  <Icon
                    icon="solar:chat-round-dots-linear"
                    className="text-white"
                    width={28}
                    height={28}
                  />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all"
                  onPress={() => currentAd && handleShare(currentAd)}
                >
                  <Icon
                    icon="solar:share-linear"
                    className="text-white"
                    width={28}
                    height={28}
                  />
                </Button>
              </div>

              {/* Mobile exit button */}
              <div className="flex lg:hidden absolute top-4 right-4 z-40">
                <Link to="/">
                  <Button
                    isIconOnly
                    variant="flat"
                    className="bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 shadow-lg rounded-xl w-12 h-12 flex items-center justify-center transition-all"
                  >
                    <Icon
                      icon="solar:close-circle-line-duotone"
                      className="text-white"
                      width={24}
                      height={24}
                    />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PC action buttons */}
          <div className="hidden lg:flex flex-col gap-3 z-30 absolute bottom-8 right-4">
            <Button
              isIconOnly
              variant="flat"
              className={`shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all duration-200 border ${
                currentAd?.is_liked
                  ? "bg-red-500 hover:bg-red-600 border-red-400"
                  : "bg-black/30 backdrop-blur-xl hover:bg-white/10 border-white/10"
              }`}
              onPress={() => currentAd && handleLike(currentAd.id)}
              disabled={!currentAd || likingInProgress.has(currentAd?.id || "")}
            >
              {likingInProgress.has(currentAd?.id || "") ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Icon
                  icon={
                    currentAd?.is_liked
                      ? "solar:heart-bold"
                      : "solar:heart-linear"
                  }
                  className="text-white"
                  width={28}
                  height={28}
                />
              )}
            </Button>
            <Button
              isIconOnly
              variant="flat"
              className="bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all"
              onPress={onOpen}
            >
              <Icon
                icon="solar:chat-round-dots-linear"
                className="text-white"
                width={28}
                height={28}
              />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              className="bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 shadow-xl rounded-xl w-14 h-14 flex items-center justify-center transition-all"
              onPress={() => currentAd && handleShare(currentAd)}
            >
              <Icon
                icon="solar:share-linear"
                className="text-white"
                width={28}
                height={28}
              />
            </Button>
          </div>

          {/* PC Navigation */}
          <div className="hidden lg:flex flex-col items-center gap-2 absolute top-1/2 right-4 -translate-y-1/2">
            <Button
              isIconOnly
              variant="flat"
              className="bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 shadow-lg rounded-xl w-12 h-12 flex items-center justify-center transition-all"
              onClick={() => handleSwipe("down")}
              disabled={filteredVerticals.length <= 1}
            >
              <Icon
                icon="solar:alt-arrow-up-linear"
                className="text-white"
                width={24}
                height={24}
              />
            </Button>
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-medium">
                {currentAdIndex + 1} / {filteredVerticals.length}
              </span>
            </div>
            <Button
              isIconOnly
              variant="flat"
              className="bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-white/10 shadow-lg rounded-xl w-12 h-12 flex items-center justify-center transition-all"
              onClick={() => handleSwipe("up")}
              disabled={filteredVerticals.length <= 1}
            >
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="text-white"
                width={24}
                height={24}
              />
            </Button>
          </div>
        </div>

        {/* Chat Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Отправка сообщения
                </ModalHeader>
                <ModalBody>
                  <Input
                    placeholder="Введите сообщение продавцу"
                    variant="faded"
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                  />
                  <Button
                    onPress={() => handleSendMessage(requestMsg, onClose)}
                    color="primary"
                    className="mt-4"
                  >
                    Отправить
                  </Button>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default VerticalPage;
