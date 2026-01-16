import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Badge,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react"; // Добавлены Dropdown компоненты
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import useChatStore from "../store/message";
import useAuthStore from "../store/auth";

// Функция для извлечения только времени
const formatTime = (datetime) => {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = React.useState([]);
  const [messages, setMessages] = React.useState({});
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [isMobileListVisible, setIsMobileListVisible] = React.useState(true);
  const [user, setUser] = React.useState({ id: null });
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [dropdownChatId, setDropdownChatId] = useState<null | number>(null); // Состояние для управления видимостью dropdown

  const { showProfile } = useAuthStore();
  const {
    getConversations,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    deleteChat,
  } = useChatStore(); // Добавили deleteChat

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await showProfile();
        setUser(profile || { id: null });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [showProfile]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      setShouldScrollToBottom(true);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (chatId: any) => {
    try {
      const response = await getMessages(chatId);
      setMessages((prev) => ({ ...prev, [chatId]: response || [] }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;
    try {
      await sendMessage(selectedConversation, message);
      await fetchMessages(selectedConversation);
      setMessage("");
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleConversationSelect = async (id: any) => {
    setSelectedConversation(id);
    setIsMobileListVisible(false);
    if (id) {
      await markMessagesAsRead(id);
      await fetchMessages(id);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      await deleteChat(chatId);
      setConversations((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedConversation === chatId) {
        setSelectedConversation(null);
      }
      setDropdownChatId(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (
      shouldScrollToBottom &&
      messagesEndRef.current &&
      selectedConversation
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [
    messages[selectedConversation],
    shouldScrollToBottom,
    selectedConversation,
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.scrollTop <=
          container.clientHeight + 10;
        setShouldScrollToBottom(isAtBottom);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedConversation]);

  const currentMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];
  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );
  const otherParticipant = currentConversation?.participants.find(
    (p) => p.id !== (user.id || null)
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const newMessage =
        message.substring(0, cursorPosition) +
        "\n" +
        message.substring(cursorPosition);
      setMessage(newMessage);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPosition + 1;
      }, 0);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Сообщения</h1>
        <p className="text-default-600 text-base sm:text-lg">
          Общайтесь с покупателями и продавцами
        </p>
      </motion.div>
      <Card className="glass-card border-none h-[calc(80vh-100px)]">
        <CardBody className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="md:hidden border-b border-divider">
              <Tabs
                aria-label="Message view"
                selectedKey={isMobileListVisible ? "list" : "chat"}
                onSelectionChange={(key) =>
                  setIsMobileListVisible(key === "list")
                }
                className="w-full"
              >
                <Tab
                  key="list"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:users" />
                      <span>Контакты</span>
                    </div>
                  }
                />
                <Tab
                  key="chat"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:message-circle" />
                      <span>Чат</span>
                      {otherParticipant && (
                        <span className="text-sm truncate text-default-500">
                          ({otherParticipant.full_name})
                        </span>
                      )}
                    </div>
                  }
                />
              </Tabs>
            </div>
            <div
              className={`border-r border-divider md:block ${
                isMobileListVisible ? "block" : "hidden"
              } overflow-auto`}
            >
              <div className="p-3 border-b border-divider">
                <Input
                  placeholder="Поиск сообщений"
                  startContent={
                    <Icon icon="lucide:search" className="text-default-400" />
                  }
                  size="sm"
                />
              </div>
              <div className="overflow-y-auto h-[calc(80vh-180px)]">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => {
                    const other = conversation.participants.find(
                      (p) => p.id !== (user.id || null)
                    );
                    return (
                      <div
                        key={conversation.id}
                        className={`p-3 border-b border-divider hover:bg-default-100 cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-default-100"
                            : ""
                        }`}
                        onClick={() =>
                          handleConversationSelect(conversation.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar
                              src={other?.profile_image}
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-sm truncate">
                                {other?.full_name}
                              </h3>
                              <span className="text-xs text-default-500">
                                {formatTime(
                                  conversation.last_message?.timestamp
                                ) || formatTime(conversation.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-default-500 truncate">
                              {conversation.last_message?.content ||
                                "Нет сообщений"}
                            </p>
                          </div>
                          {conversation.unread_count > 0 ? (
                            <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs">
                              {conversation.unread_count}
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-default-500">
                    Нет чатов
                  </div>
                )}
              </div>
            </div>
            <div
              className={`flex flex-col h-full md:col-span-2 ${
                isMobileListVisible ? "hidden" : "block"
              } md:block overflow-hidden md:overflow-auto`}
            >
              {selectedConversation && currentConversation ? (
                <>
                  <div className="p-3 border-b border-divider flex items-center justify-between sticky top-0 bg-background">
                    <div className="flex items-center gap-3">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="md:hidden"
                        onPress={() => setIsMobileListVisible(true)}
                      >
                        <Icon icon="lucide:chevron-left" />
                      </Button>
                      <div className="relative">
                        <Avatar
                          src={otherParticipant?.profile_image}
                          className="w-8 h-8"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {otherParticipant?.full_name}
                        </h3>
                        <p className="text-xs text-default-500">В сети</p>
                      </div>
                    </div>
                    <Dropdown
                      isOpen={dropdownChatId === selectedConversation}
                      onOpenChange={(isOpen) =>
                        setDropdownChatId(isOpen ? selectedConversation : null)
                      }
                    >
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key={"delete-chat"}
                          onClick={() => handleDeleteChat(selectedConversation)}
                        >
                          Удалить чат?
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto md:pt-4 pt-[64px] pb-0 p-4 space-y-4 min-h-[81%]"
                  >
                    {currentMessages.length > 0 ? (
                      currentMessages.map((msg) => {
                        const isOwn = msg.sender.id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isOwn
                                  ? "bg-primary text-white rounded-br-none"
                                  : "bg-default-200 rounded-bl-none"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.content}
                              </p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                  isOwn ? "text-white/70" : "text-default-500"
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                                {isOwn && (
                                  <Icon
                                    icon={
                                      msg.isRead
                                        ? "lucide:check-check"
                                        : "lucide:check"
                                    }
                                    className="text-xs"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-default-500">
                        Нет сообщений
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 border-t border-divider sticky bottom-0 bg-background">
                    <div className="flex gap-2">
                      <Button isIconOnly variant="flat" size="sm">
                        <Icon icon="lucide:plus" />
                      </Button>
                      <textarea
                        placeholder="Введите сообщение..."
                        value={message}
                        onChange={handleChange}
                        className="flex-1 p-2 border rounded w-full resize-none"
                        onKeyDown={handleKeyDown}
                        rows={1}
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        onPress={handleSendMessage}
                        isDisabled={!message.trim()}
                      >
                        <Icon icon="lucide:send" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Icon
                    icon="lucide:message-circle"
                    className="text-5xl text-default-300 mb-4"
                  />
                  <h3 className="text-xl font-medium mb-2">Выберите чат</h3>
                  <p className="text-default-500 max-w-md">
                    Выберите существующий чат или начните новый разговор
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
