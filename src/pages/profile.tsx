import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider,
  Progress,
  Chip,
  Spinner,
  Image,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import useAuthStore from "../store/auth";
import useAuth from "../helper/is_auth";
import { message } from "antd";

interface UserStats {
  user_id: number;
  full_name?: string;
  email?: string;
  phone_number?: string;
  active_announcements: number;
  reviews_count: number;
  rating: number;
  total_sales: number;
  total_income: number;
  net_income: number;
  registered_at?: string;
  company_name?: string;
  profile_image?: string;

  // Детальная статистика
  products_count: number;
  auctions_count: number;
  services_count: number;
  fm_count: number;
  verticals_count: number;
  reviews_written: number;
  reviews_received: number;
  bids_made: number;
}

interface UserListing {
  id: number;
  title: string;
  type: "product" | "auction" | "service" | "fm" | "vertical";
  type_display: string;
  price: number;
  status: "active" | "expired";
  status_display: string;
  created_at: string;
  image?: string;
  category: string;
  description?: string;
  end_time?: string; // для аукционов
  is_featured?: boolean; // для аукционов
  rating?: number; // для услуг
}

interface ListingsResponse {
  listings: UserListing[];
  stats: {
    total_listings: number;
    products_count: number;
    auctions_count: number;
    services_count: number;
    fm_count: number;
    verticals_count: number;
    active_count: number;
    expired_count: number;
  };
  message: string;
}

export const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("analytics");
  const { showUserStats, showUserListings } = useAuthStore();
  const { isLoggedIn } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [listingsStats, setListingsStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для получения статистики пользователя
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await showUserStats();

      if (response && response.data) {
        setUserStats(response.data);
      } else {
        throw new Error("Не удалось получить данные статистики");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения объявлений пользователя
  const fetchUserListings = async () => {
    try {
      setListingsLoading(true);
      const response = await showUserListings();

      if (response && response.data) {
        setUserListings(response.data.listings || []);
        setListingsStats(response.data.stats || null);
      }
    } catch (err) {
      console.error("Error fetching user listings:", err);
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserStats();
      fetchUserListings();
    }
  }, [isLoggedIn]);

  // Навигационные функции
  const handleCreateListing = () => {
    history.push("/create-listing");
  };

  const handleCreateAuction = () => {
    history.push("/create-auction");
  };

  const handleGoToMessages = () => {
    history.push("/messages");
  };

  const handleGoToFavorites = () => {
    history.push("/favorites");
  };

  const handleGoToHistory = () => {
    history.push("/history");
  };

  const handleEditProfile = () => {
    history.push("/edit-profile");
  };

  const handleGoToSettings = () => {
    history.push("/settings");
  };

  const handleViewListing = (listing: UserListing) => {
    switch (listing.type) {
      case "product":
        history.push(`/products/${listing.id}`);
        break;
      case "auction":
        history.push(`/auctions/${listing.id}`);
        break;
      case "service":
        history.push(`/service/${listing.id}`);
        break;
      case "fm":
        history.push(`/fm/${listing.id}`);
        break;
      case "vertical":
        history.push(`/vertical/${listing.id}`);
        break;
      default:
        console.warn("Unknown listing type:", listing.type);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return "lucide:package";
      case "auction":
        return "lucide:gavel";
      case "service":
        return "lucide:wrench";
      case "fm":
        return "lucide:zap";
      case "vertical":
        return "lucide:layout-grid";
      default:
        return "lucide:tag";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "product":
        return "primary";
      case "auction":
        return "success";
      case "service":
        return "warning";
      case "fm":
        return "danger";
      case "vertical":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "danger";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Завершен";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const calculateCompletionRate = () => {
    if (!userStats) return 0;
    return Math.min(95, (userStats.rating / 5) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <Card className="glass-card border-none">
          <CardBody className="text-center py-12">
            <Icon
              icon="lucide:alert-circle"
              className="text-danger text-4xl mb-4 mx-auto"
            />
            <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
            <p className="text-default-500 mb-4">{error}</p>
            <Button color="primary" onPress={fetchUserStats}>
              Попробовать снова
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">{t("navigation.profile")}</h1>
        <p className="text-default-600 text-lg">
          Управляйте своим профилем и просматривайте статистику
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass-card border-none mb-6">
            <CardBody className="p-6 flex flex-col items-center text-center">
              <Avatar
                src={"http://127.0.0.1:8000" + userStats?.profile_image}
                className="w-24 h-24 mb-4"
                alt={userStats?.full_name || "User avatar"}
              />
              <h2 className="text-xl font-bold">
                {userStats?.full_name || "Имя пользователя"}
              </h2>
              <p className="text-default-500 mb-1">
                {userStats?.company_name || "Компания не указана"}
              </p>
              {userStats?.phone_number && (
                <p className="text-default-500 mb-2">
                  {userStats.phone_number}
                </p>
              )}
              {userStats?.email && (
                <p className="text-default-500 mb-4 text-sm">
                  {userStats.email}
                </p>
              )}
              {userStats?.registered_at && (
                <p className="text-default-400 text-sm mb-4">
                  Зарегистрирован:{" "}
                  {new Date(userStats.registered_at).toLocaleDateString(
                    "ru-RU",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              )}

              <div className="flex items-center gap-1 mb-2">
                <Icon icon="lucide:star" className="text-yellow-500" />
                <span className="font-medium">
                  {userStats?.rating?.toFixed(2) || "0.00"}
                </span>
                <span className="text-default-500 text-sm">
                  ({userStats?.reviews_received || 0} отзывов)
                </span>
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Рейтинг завершения</span>
                  <span className="text-sm font-medium">
                    {calculateCompletionRate().toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={calculateCompletionRate()}
                  color="success"
                  className="h-2"
                />
              </div>

              <Divider className="my-4 w-full" />

              <Button
                color="primary"
                variant="flat"
                className="w-full mb-2"
                startContent={<Icon icon="lucide:edit" />}
                onPress={handleEditProfile}
              >
                Редактировать профиль
              </Button>

              <Button
                variant="light"
                className="w-full"
                startContent={<Icon icon="lucide:settings" />}
                onPress={handleGoToSettings}
              >
                Настройки
              </Button>
            </CardBody>
          </Card>

          <Card className="glass-card border-none">
            <CardBody className="p-4">
              <h3 className="font-semibold mb-3">Быстрые действия</h3>
              <div className="space-y-2">
                <Button
                  variant="flat"
                  color="primary"
                  className="w-full justify-start"
                  startContent={<Icon icon="lucide:plus-circle" />}
                  onPress={handleCreateListing}
                >
                  Создать объявление
                </Button>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<Icon icon="lucide:gavel" />}
                  onPress={handleCreateAuction}
                >
                  Создать аукцион
                </Button>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<Icon icon="lucide:message-circle" />}
                  onPress={handleGoToMessages}
                >
                  Сообщения
                </Button>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<Icon icon="lucide:heart" />}
                  onPress={() =>
                    message.info("Функция избранного в разработке")
                  }
                >
                  Избранное
                </Button>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<Icon icon="lucide:history" />}
                  onPress={() => message.info("Функция истории в разработке")}
                >
                  История просмотров
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="glass-card border-none">
            <CardHeader>
              <Tabs
                aria-label="Profile tabs"
                selectedKey={activeTab}
                onSelectionChange={setActiveTab as any}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6 flex-wrap justify-center",
                  tab: "max-w-fit px-2 h-12",
                }}
              >
                <Tab
                  key="analytics"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:bar-chart-2" />
                      <span>Аналитика</span>
                    </div>
                  }
                />
                <Tab
                  key="listings"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:list" />
                      <span>
                        Мои объявления (
                        {listingsStats?.total_listings ||
                          userStats?.active_announcements ||
                          0}
                        )
                      </span>
                    </div>
                  }
                />
                <Tab
                  key="sales"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:shopping-bag" />
                      <span>Продажи</span>
                    </div>
                  }
                />
                <Tab
                  key="reviews"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:star" />
                      <span>Отзывы ({userStats?.reviews_written || 0})</span>
                    </div>
                  }
                />
                <Tab
                  key="bids"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:gavel" />
                      <span>Ставки ({userStats?.bids_made || 0})</span>
                    </div>
                  }
                />
              </Tabs>
            </CardHeader>
            <CardBody>
              {activeTab === "analytics" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-content2 border-none">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-default-500 text-sm">
                              Всего продаж
                            </p>
                            <h3 className="text-2xl font-bold">
                              {formatCurrency(userStats?.total_sales || 0)}
                            </h3>
                          </div>
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon
                              icon="lucide:shopping-bag"
                              className="text-primary"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-content2 border-none">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-default-500 text-sm">
                              Общий доход
                            </p>
                            <h3 className="text-2xl font-bold">
                              {formatCurrency(userStats?.total_income || 0)}
                            </h3>
                          </div>
                          <div className="p-2 rounded-full bg-success/10">
                            <Icon
                              icon="lucide:dollar-sign"
                              className="text-success"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-content2 border-none">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-default-500 text-sm">
                              Чистая прибыль
                            </p>
                            <h3 className="text-2xl font-bold">
                              {formatCurrency(userStats?.net_income || 0)}
                            </h3>
                          </div>
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon
                              icon="lucide:wallet"
                              className="text-primary"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-content2 border-none">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-default-500 text-sm">
                              Активных объявлений
                            </p>
                            <h3 className="text-2xl font-bold">
                              {userStats?.active_announcements || 0}
                            </h3>
                          </div>
                          <div className="p-2 rounded-full bg-warning/10">
                            <Icon icon="lucide:tag" className="text-warning" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-content2 border-none">
                      <CardHeader className="pb-0">
                        <h3 className="text-lg font-semibold">
                          Статистика по типам объявлений
                        </h3>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:package"
                                className="text-primary"
                              />
                              <span>Товары</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.products_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:gavel"
                                className="text-success"
                              />
                              <span>Аукционы</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.auctions_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:wrench"
                                className="text-warning"
                              />
                              <span>Услуги</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.services_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon icon="lucide:zap" className="text-danger" />
                              <span>FM объявления</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.fm_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:layout-grid"
                                className="text-secondary"
                              />
                              <span>Вертикали</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.verticals_count || 0}
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-content2 border-none">
                      <CardHeader className="pb-0">
                        <h3 className="text-lg font-semibold">Активность</h3>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:edit"
                                className="text-primary"
                              />
                              <span>Написано отзывов</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.reviews_written || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:star"
                                className="text-warning"
                              />
                              <span>Получено отзывов</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.reviews_received || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:hand-metal"
                                className="text-success"
                              />
                              <span>Сделано ставок</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.bids_made || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="lucide:award"
                                className="text-secondary"
                              />
                              <span>Рейтинг</span>
                            </div>
                            <span className="font-semibold">
                              {userStats?.rating?.toFixed(2) || "0.00"} / 5.00
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === "listings" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {listingsLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : userListings.length > 0 ? (
                    <div className="space-y-6">
                      {/* Статистика объявлений */}
                      {listingsStats && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:package"
                                  className="text-primary text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">
                                    Товары
                                  </p>
                                  <p className="font-semibold">
                                    {listingsStats.products_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:gavel"
                                  className="text-success text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">
                                    Аукционы
                                  </p>
                                  <p className="font-semibold">
                                    {listingsStats.auctions_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:wrench"
                                  className="text-warning text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">
                                    Услуги
                                  </p>
                                  <p className="font-semibold">
                                    {listingsStats.services_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:zap"
                                  className="text-danger text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">FM</p>
                                  <p className="font-semibold">
                                    {listingsStats.fm_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:layout-grid"
                                  className="text-secondary text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">
                                    Вертикали
                                  </p>
                                  <p className="font-semibold">
                                    {listingsStats.verticals_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          <Card className="bg-content2 border-none">
                            <CardBody className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Icon
                                  icon="lucide:check-circle"
                                  className="text-success text-lg"
                                />
                                <div>
                                  <p className="text-xs text-default-500">
                                    Активные
                                  </p>
                                  <p className="font-semibold">
                                    {listingsStats.active_count}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </div>
                      )}

                      {/* Список объявлений */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userListings.map((listing) => (
                          <Card
                            key={`${listing.type}-${listing.id}`}
                            className="bg-content2 border-none hover:shadow-lg transition-shadow h-full flex flex-col"
                          >
                            <CardBody className="p-4 flex flex-col h-full">
                              {/* Изображение */}
                              {listing.image && (
                                <div className="w-full h-32 mb-3 overflow-hidden rounded-lg flex-shrink-0">
                                  <Image
                                    src={listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    fallbackSrc="https://via.placeholder.com/300x200"
                                  />
                                </div>
                              )}

                              {/* Заголовок и статусы */}
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold truncate flex-1 mr-2">
                                  {listing.title}
                                </h4>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                  <Chip
                                    size="sm"
                                    color={
                                      getStatusColor(listing.status) as any
                                    }
                                    variant="flat"
                                  >
                                    {listing.status_display}
                                  </Chip>
                                  {listing.is_featured && (
                                    <Chip
                                      size="sm"
                                      color="warning"
                                      variant="flat"
                                    >
                                      Рекомендуемый
                                    </Chip>
                                  )}
                                </div>
                              </div>

                              {/* Тип и категория */}
                              <div className="flex items-center gap-2 mb-2">
                                <Icon
                                  icon={getTypeIcon(listing.type)}
                                  className={`text-${getTypeColor(
                                    listing.type
                                  )}`}
                                />
                                <Chip
                                  size="sm"
                                  color={getTypeColor(listing.type) as any}
                                  variant="flat"
                                >
                                  {listing.type_display}
                                </Chip>
                                <span className="text-xs text-default-500">
                                  {listing.category}
                                </span>
                              </div>

                              {/* Цена */}
                              {listing.price > 0 && (
                                <p className="font-semibold text-lg mb-2">
                                  {formatCurrency(listing.price)}
                                </p>
                              )}

                              {/* Описание */}
                              <div className="flex-grow mb-3">
                                {listing.description && (
                                  <p className="text-sm text-default-600 line-clamp-3">
                                    {listing.description}
                                  </p>
                                )}
                              </div>

                              {/* Дополнительная информация */}
                              <div className="space-y-1 mb-3 flex-shrink-0">
                                {listing.type === "auction" &&
                                  listing.end_time && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon
                                        icon="lucide:clock"
                                        className="text-warning"
                                      />
                                      <span>
                                        Осталось:{" "}
                                        {formatTimeLeft(listing.end_time)}
                                      </span>
                                    </div>
                                  )}

                                {listing.type === "service" &&
                                  listing.rating && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon
                                        icon="lucide:star"
                                        className="text-yellow-500"
                                      />
                                      <span>{listing.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                              </div>

                              {/* Действия */}
                              <div className="flex gap-2 mt-auto">
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="w-full"
                                  startContent={<Icon icon="lucide:eye" />}
                                  onPress={() => handleViewListing(listing)}
                                >
                                  Просмотреть
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>

                      {/* Кнопка добавления нового объявления */}
                      <div className="text-center mt-6">
                        <Button
                          color="primary"
                          size="lg"
                          startContent={<Icon icon="lucide:plus" />}
                          onPress={handleCreateListing}
                        >
                          Создать новое объявление
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-default-500">
                      <Icon
                        icon="lucide:package"
                        className="text-4xl mb-4 mx-auto"
                      />
                      <h3 className="text-lg font-semibold mb-2">
                        Нет активных объявлений
                      </h3>
                      <p className="mb-4">
                        Создайте свое первое объявление, чтобы начать продавать
                      </p>
                      <Button
                        color="primary"
                        startContent={<Icon icon="lucide:plus" />}
                        onPress={handleCreateListing}
                      >
                        Создать объявление
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "sales" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center py-12 text-default-500">
                    <Icon
                      icon="lucide:shopping-bag"
                      className="text-4xl mb-4 mx-auto"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      История продаж
                    </h3>
                    <p className="mb-4">
                      Здесь будет отображаться история ваших продаж
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:trending-up"
                            className="text-success text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Общие продажи</h4>
                          <p className="text-2xl font-bold text-success">
                            {formatCurrency(userStats?.total_sales || 0)}
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:dollar-sign"
                            className="text-primary text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Общий доход</h4>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(userStats?.total_income || 0)}
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:wallet"
                            className="text-warning text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Чистая прибыль</h4>
                          <p className="text-2xl font-bold text-warning">
                            {formatCurrency(userStats?.net_income || 0)}
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                    <div className="mt-6">
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="lucide:download" />}
                      >
                        Экспорт отчета
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    {/* Статистика отзывов */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:edit"
                            className="text-primary text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Написано отзывов</h4>
                          <p className="text-2xl font-bold text-primary">
                            {userStats?.reviews_written || 0}
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:star"
                            className="text-warning text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Получено отзывов</h4>
                          <p className="text-2xl font-bold text-warning">
                            {userStats?.reviews_received || 0}
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:award"
                            className="text-success text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Средний рейтинг</h4>
                          <p className="text-2xl font-bold text-success">
                            {userStats?.rating?.toFixed(2) || "0.00"}
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Заглушка для списка отзывов */}
                    <div className="text-center py-12 text-default-500">
                      <Icon
                        icon="lucide:message-square"
                        className="text-4xl mb-4 mx-auto"
                      />
                      <h3 className="text-lg font-semibold mb-2">
                        Список отзывов
                      </h3>
                      <p className="mb-4">
                        Здесь будут отображаться отзывы, которые вы написали и
                        получили
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button color="primary" variant="flat">
                          Мои отзывы
                        </Button>
                        <Button color="secondary" variant="flat">
                          Отзывы обо мне
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "bids" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    {/* Статистика ставок */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:gavel"
                            className="text-primary text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Всего ставок</h4>
                          <p className="text-2xl font-bold text-primary">
                            {userStats?.bids_made || 0}
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:trophy"
                            className="text-warning text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Выигранные</h4>
                          <p className="text-2xl font-bold text-warning">
                            {/* Заглушка - в API пока нет */}0
                          </p>
                        </CardBody>
                      </Card>
                      <Card className="bg-content2 border-none">
                        <CardBody className="text-center p-4">
                          <Icon
                            icon="lucide:clock"
                            className="text-success text-2xl mb-2 mx-auto"
                          />
                          <h4 className="font-semibold">Активные</h4>
                          <p className="text-2xl font-bold text-success">
                            {/* Заглушка - в API пока нет */}0
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Заглушка для списка ставок */}
                    <div className="text-center py-12 text-default-500">
                      <Icon
                        icon="lucide:hand-metal"
                        className="text-4xl mb-4 mx-auto"
                      />
                      <h3 className="text-lg font-semibold mb-2">
                        История ставок
                      </h3>
                      <p className="mb-4">
                        Здесь будет отображаться история ваших ставок на
                        аукционах
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button color="primary" variant="flat">
                          Активные ставки
                        </Button>
                        <Button color="secondary" variant="flat">
                          История ставок
                        </Button>
                        <Button
                          color="success"
                          variant="flat"
                          onPress={() => history.push("/auctions")}
                        >
                          Найти аукционы
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
