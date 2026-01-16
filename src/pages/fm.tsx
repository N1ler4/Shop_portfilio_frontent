import React, { useEffect, useState } from "react";
import {
  Card,
  Chip,
  Avatar,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import useFmStore from "../store/fm";
import useAuth from "../helper/is_auth";
import useChatStore from "../store/message";
import { message } from "antd";

// Модальные окна остаются без изменений
const StoryModal: React.FC<{
  order: any;
  onClose: () => void;
  onSendRequest: () => void;
  onLike: (fmId: string) => void;
}> = ({ order, onClose, onSendRequest, onLike }) => {
  if (!order) return null;

  const mediaType = order.fm_video ? "video" : order.fm_img ? "image" : "voice";
  const mediaUrl =
    order.fm_video ||
    order.fm_img ||
    "https://www.w3schools.com/html/horse.mp3";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ pointerEvents: "auto" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full min-h-screen h-screen max-h-screen mx-auto bg-transparent flex flex-col items-center justify-center p-0 overflow-hidden md:bg-white md:rounded-2xl md:shadow-2xl md:max-w-xl md:max-h-[90vh] md:p-0 md:flex-col md:items-stretch"
          style={{ backdropFilter: "blur(8px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {mediaType === "image" && (
            <img
              src={mediaUrl}
              alt={order.fm_name}
              className="absolute inset-0 w-full h-full object-cover z-0 select-none md:static md:rounded-2xl md:w-full md:h-full md:max-h-[90vh] md:z-0"
              draggable={false}
            />
          )}
          {mediaType === "video" && (
            <video
              controls
              className="absolute inset-0 w-full h-full object-cover z-0 bg-black select-none md:static md:rounded-2xl md:w-full md:h-full md:max-h-[90vh] md:z-0"
              draggable={false}
            >
              <source src={mediaUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          )}
          {mediaType === "voice" && (
            <audio
              controls
              className="w-full z-0 select-none md:rounded-2xl md:w-full md:h-auto md:z-0"
            >
              <source src={mediaUrl} type="audio/mp3" />
              Ваш браузер не поддерживает аудио.
            </audio>
          )}
          <button
            className="absolute top-4 right-4 z-20 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition md:bg-white md:text-black md:shadow md:top-3 md:right-3"
            onClick={onClose}
            aria-label="Закрыть"
            type="button"
          >
            <Icon icon="lucide:x" width={28} height={28} />
          </button>
          <div className="fixed right-4 bottom-36 flex flex-col gap-4 z-30 md:static md:right-auto md:bottom-auto md:flex-row md:gap-2 md:ml-auto md:mr-6 md:mt-4 md:z-10">
            <button
              className={`rounded-full p-4 shadow-lg flex items-center justify-center md:p-3 md:shadow ${
                order.is_liked
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/80 text-primary hover:bg-white md:bg-white md:hover:bg-gray-100"
              }`}
              onClick={() => onLike(order.id)}
            >
              <Icon icon="lucide:heart" width={28} height={28} />
            </button>
            <button
              className="bg-primary hover:bg-primary/80 text-white rounded-full p-4 shadow-lg flex items-center justify-center md:p-3 md:shadow md:bg-primary md:hover:bg-primary/80"
              onClick={onSendRequest}
            >
              <Icon icon="lucide:send" width={28} height={28} />
            </button>
          </div>
          <div className="w-full text-white px-6 py-6 rounded-t-3xl mt-auto flex flex-col items-start gap-3 z-20 relative md:bg-white md:text-black md:rounded-b-2xl md:rounded-t-none md:px-8 md:py-6 md:mt-0 md:z-10">
            <h2 className="text-xl font-bold mb-1">{order.fm_name}</h2>
            <div className="text-base mb-2">
              {order.fm_work_title || "Описание отсутствует"}
            </div>
            <div className="flex items-center gap-3">
              <Avatar
                src={order.seller_img}
                name={order.seller_name}
                size="sm"
              />
              <span className="font-medium text-inherit text-sm">
                {order.seller_name}
              </span>
              <span className="text-xs text-inherit ml-2">
                {order.fm_city && order.fm_region
                  ? `${order.fm_city}, ${order.fm_region}`
                  : "г. Ташкент, Мирабадский р-н"}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const RequestModal: React.FC<{
  onClose: () => void;
  price: string;
  setPrice: (v: string) => void;
  msg: string;
  setMsg: (v: string) => void;
  onSend: () => void;
  sellerId: string;
}> = ({ onClose, price, setPrice, msg, setMsg, onSend, sellerId }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ pointerEvents: "auto" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-10 text-black bg-black/10 rounded-full p-2 hover:bg-black/20 transition"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <Icon icon="lucide:x" width={24} height={24} />
        </button>
        <h3 className="text-lg font-bold mb-2 text-center">Быстрый запрос</h3>
        <Input
          type="number"
          placeholder="Ваша цена, сум"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Сообщение автору..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          minRows={3}
          className="mb-2"
        />
        <Button color="primary" className="mt-2 w-full" onPress={onSend}>
          Отправить
        </Button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const CreateFMModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: { id: number; fm_category_name: string }[];
}> = ({ onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    fm_name: "",
    fm_work_title: "",
    fm_category: 0,
    fm_city: "",
    fm_region: "",
    mediaFile: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        message.error("Пожалуйста, загрузите изображение или видео.");
        return;
      }
      setFormData((prev) => ({ ...prev, mediaFile: file }));
    }
  };

  const handleSubmit = () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        if (key === "mediaFile" && value) {
          data.append(
            formData.mediaFile.type.startsWith("image/")
              ? "fm_img"
              : "fm_video",
            value
          );
        } else if (key !== "mediaFile") {
          data.append(key, value);
        }
      }
    });
    onSubmit(data);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ pointerEvents: "auto" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 z-10 text-black bg-black/10 rounded-full p-2 hover:bg-black/20 transition"
            onClick={onClose}
            aria-label="Закрыть"
            type="button"
          >
            <Icon icon="lucide:x" width={24} height={24} />
          </button>
          <Input
            name="fm_name"
            placeholder="Название заказа"
            value={formData.fm_name}
            onChange={handleChange}
            className="mb-2"
          />
          <Textarea
            name="fm_work_title"
            placeholder="Описание заказа"
            value={formData.fm_work_title}
            onChange={handleChange}
            minRows={3}
            className="mb-2"
          />
          <Select
            name="fm_category"
            label="Категория"
            value={formData.fm_category.toString()}
            onChange={(e) =>
              handleChange({
                target: { name: "fm_category", value: e.target.value },
              } as any)
            }
            className="mb-2"
          >
            {categories
              .filter((cat) => cat.id !== 0)
              .map((cat) => (
                <SelectItem key={cat.id} data-value={cat.id.toString()}>
                  {cat.fm_category_name}
                </SelectItem>
              ))}
          </Select>
          <Input
            name="fm_city"
            placeholder="Город"
            value={formData.fm_city}
            onChange={handleChange}
            className="mb-2"
          />
          <Input
            name="fm_region"
            placeholder="Район"
            value={formData.fm_region}
            onChange={handleChange}
            className="mb-2"
          />
          <Input
            type="file"
            name="mediaFile"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          <Button
            color="primary"
            className="mt-2 w-full"
            onPress={handleSubmit}
          >
            Создать
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const FMPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [modalOrder, setModalOrder] = useState<null | any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCreateFMModal, setShowCreateFMModal] = useState(false);
  const [requestPrice, setRequestPrice] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [fmCategories, setFMCategories] = useState([
    { id: 0, fm_category_name: "Все" },
  ]);
  const [fmData, setFmData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { getFMCategories, getFm, postFm, likeFm } = useFmStore();
  const { createChat, sendMessage, getConversations } = useChatStore();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const conversations = await getConversations();
        setChats(conversations || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchChats();
  }, [getConversations]);

  useEffect(() => {
    getFMCategories()
      .then((data) => {
        if (data && data) {
          setFMCategories([{ id: 0, fm_category_name: "Все" }, ...data]);
        }
      })
      .catch((err) => console.error("Error fetching FM categories:", err));
  }, [getFMCategories]);

  useEffect(() => {
    getFm(`page=${currentPage}`)
      .then((data) => {
        if (data) {
          setFmData(data);
          setUser(data.seller)
        }
      })
      .catch((err) => console.error("Error fetching FM orders:", err));
  }, [getFm, currentPage]);

  const handleLike = async (fmId: string) => {
    const response = await likeFm(fmId);
    if (response) {
      setFmData((prev) => ({
        ...prev,
        results: prev.results.map((order) =>
          order.id === fmId ? { ...order, is_liked: !order.is_liked } : order
        ),
      }));
    }
  };

  const handleSendRequest = async () => {
    if (!modalOrder || !requestPrice || !requestMsg || !user || !user.id) {
      message.error("Пользователь или данные не загружены.");
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

      const sellerId = modalOrder.seller_id || modalOrder.user_id;
      const existingChats = chats.filter(
        (chat: any) => chat.companion_id == sellerId
      );
      const existingChat = existingChats[0];

      let chatId: any;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        const chatResponse = await createChat(sellerId);
        if (chatResponse && chatResponse.id) {
          chatId = chatResponse.id;
          setChats((prev) => [...prev, chatResponse]);
        } else {
          throw new Error("Failed to create chat");
        }
      }

      const messageData = `Ответ на работу FM: ${modalOrder.fm_name}\nПредлагаю за эту работу: ${requestPrice} $\nВот что я могу вам предложить за эту сумму: ${requestMsg}`;
      await sendMessage(chatId, messageData);

      setShowRequestModal(false);
      setRequestPrice("");
      setRequestMsg("");
      message.success("Запрос успешно отправлен!");
    } catch (error) {
      console.error("Error in request process:", error);
      if (error.response) {
        console.log("Error details:", error.response.data);
      }
      message.error("Не удалось отправить запрос. Попробуйте еще раз.");
    }
  };

  const handleCreateFM = async (data: FormData) => {
    const response = await postFm(data);
    if (response) {
      setFmData((prev) => ({
        ...prev,
        results: [response, ...prev.results],
        count: prev.count + 1,
      }));
    }
  };

  const filteredOrders =
    selectedCategory === "Все"
      ? fmData.results
      : fmData.results.filter(
          (order) =>
            order.fm_category_details.fm_category_name === selectedCategory
        );

  const totalPages = Math.ceil(fmData.count / 10);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Категории как горизонтальные кнопки */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icon icon="lucide:zap" className="text-primary" /> FM — Быстрые
          заказы на услуги
        </h2>
        <div className="flex gap-2 mb-6 flex-wrap">
          {fmCategories.map((cat) => (
            <Chip
              key={cat.id}
              className={`rounded-full px-4 py-2 text-sm font-semibold cursor-pointer ${
                selectedCategory === cat.fm_category_name
                  ? "bg-primary text-white"
                  : "bg-content2 text-default-700"
              }`}
              onClick={() => setSelectedCategory(cat.fm_category_name)}
            >
              {cat.fm_category_name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Сетка заказов */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="rounded-xl p-4 cursor-pointer border border-content2 transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50 hover:bg-primary/5"
              isPressable
              onPress={() => setModalOrder(order)}
            >
              <div className="flex flex-col gap-2 text-left">
                {/* Категория и автор */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                    {order.fm_category_details.fm_category_name}
                  </span>
                  <span className="text-xs text-default-400">
                    {order.seller_name}
                  </span>
                </div>

                {/* Заголовок */}
                <h3 className="text-base font-semibold text-left">
                  {order.fm_name}
                </h3>

                {/* Описание */}
                <div className="text-xs text-default-500 line-clamp-2 text-left">
                  {order.fm_work_title || "Описание отсутствует"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Icon
            icon="lucide:inbox"
            width={64}
            height={64}
            className="text-default-300 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-default-500 mb-2">
            Заказы не найдены
          </h3>
          <p className="text-default-400">
            В выбранной категории пока нет заказов
          </p>
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            isIconOnly
            variant="light"
            disabled={!fmData.previous}
            onPress={() => setCurrentPage((prev) => prev - 1)}
          >
            <Icon icon="lucide:chevron-left" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "solid" : "light"}
                  color={currentPage === page ? "primary" : "default"}
                  onPress={() => setCurrentPage(page)}
                  size="sm"
                  className="min-w-10"
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-default-400">...</span>
                <Button
                  variant={currentPage === totalPages ? "solid" : "light"}
                  color={currentPage === totalPages ? "primary" : "default"}
                  onPress={() => setCurrentPage(totalPages)}
                  size="sm"
                  className="min-w-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            isIconOnly
            variant="light"
            disabled={!fmData.next}
            onPress={() => setCurrentPage((prev) => prev + 1)}
          >
            <Icon icon="lucide:chevron-right" />
          </Button>
        </div>
      )}

      {/* Кнопка создания заказа */}
      {isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            color="primary"
            size="lg"
            isIconOnly
            className="rounded-full shadow-lg w-16 h-16"
            onPress={() => setShowCreateFMModal(true)}
          >
            <Icon icon="lucide:plus" width={28} height={28} />
          </Button>
        </div>
      )}

      {/* Модальные окна */}
      {modalOrder && (
        <StoryModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onSendRequest={() => {
            if (!isLoggedIn) {
              message.warning("Пожалуйста, войдите в систему");
              return;
            }
            setShowRequestModal(true);
          }}
          onLike={handleLike}
        />
      )}
      {showRequestModal && (
        <RequestModal
          onClose={() => setShowRequestModal(false)}
          price={requestPrice}
          setPrice={setRequestPrice}
          msg={requestMsg}
          setMsg={setRequestMsg}
          onSend={handleSendRequest}
          sellerId={modalOrder?.seller_id}
        />
      )}
      {showCreateFMModal && (
        <CreateFMModal
          onClose={() => setShowCreateFMModal(false)}
          onSubmit={handleCreateFM}
          categories={fmCategories.filter((cat) => cat.id !== 0)}
        />
      )}
    </div>
  );
};

export default FMPage;
