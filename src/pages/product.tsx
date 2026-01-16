import React, { useEffect, useState } from "react";
import { useParams, Link as RouteLink } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Tabs,
  Tab,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "../data/products";
import { ProductCard } from "../components/product-card";
import { useLanguage } from "../context/LanguageContext";
import useProductStore from "../store/product";
import { Rating } from "../components/rating";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../store/auth";

interface ParamTypes {
  id: string;
}

interface SellerType {
  id: any;
  full_name: string;
  email: string;
  phone_number: string;
  total_sales: string;
  total_income: string;
  net_income: string;
  active_anouncements: number;
  rate: string;
  registered_at: string;
  reviews_count: number;
  profile_image: string;
  company_name: string;
}

interface Review {
  id: string;
  full_name: string;
  user_img: string;
  rating: number;
  content: string;
  created_at: string;
}

interface ProductTypes {
  id: any;
  seller: SellerType;
  product_reviews: Review[];
  product_category_details: Record<string, any>;
  product_name: string;
  product_price: string;
  product_tags: any[];
  product_desc: string;
  product_safety: any[];
  similar_products?: any[];
  region: string;
  city: string;
  district: string;
  product_img: string;
  product_images?: any[];
  created_at: string;
  isHot: boolean;
  hasAR: boolean;
  isNew: boolean;
  seller_type: string;
  delivery: string;
  avg_rating?: number;
  // Дополнительные поля для совместимости с UI
  title?: string;
  category?: string;
  image?: string;
  location?: string;
  price?: number;
  description?: string;
  specifications?: string[];
  sellerInfo?: {
    name: string;
    rating: number;
    memberSince: string;
  };
  is_liked?: number;
}

export const ProductPage: React.FC = () => {
  const { id } = useParams<ParamTypes>();
  const [product, setProduct] = useState<ProductTypes | null>(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { t } = useLanguage();
  const {
    getProductDetails,
    postReviewProduct,
    updateProduct,
    deleteProduct,
    likeProduct,
  } = useProductStore();
  const { showProfile } = useAuthStore();

  // Схема валидации для отзывов
  const ReviewSchema = Yup.object().shape({
    content: Yup.string().required("Content is required"),
    rating: Yup.number()
      .min(0.5, "Minimum rating is 0.5")
      .max(5, "Maximum rating is 5")
      .required("Rating is required"),
  });

  // Схема валидации для обновления продукта
  const UpdateProductSchema = Yup.object().shape({
    product_name: Yup.string().required("Product name is required"),
    product_price: Yup.string().required("Price is required"),
    product_desc: Yup.string().required("Description is required"),
    city: Yup.string().required("City is required"),
    region: Yup.string().required("Region is required"),
  });

  // Функция для получения массива изображений
  const getProductImages = () => {
    if (!product) return [];

    const productImages = [];

    // Основное изображение
    if (product?.image || product?.product_img) {
      productImages.push(product.image || product.product_img);
    }

    // Дополнительные изображения (если есть в API)
    if (product?.product_images && Array.isArray(product.product_images)) {
      productImages.push(
        ...product.product_images.map((img) =>
          typeof img === "string" ? img : img.image_url || img.url || img
        )
      );
    }

    // Если изображений меньше 4, повторяем существующие или добавляем placeholder'ы
    if (productImages.length > 0 && productImages.length < 4) {
      while (productImages.length < 4) {
        const indexToRepeat = productImages.length % productImages.length;
        productImages.push(productImages[indexToRepeat]);
      }
    }

    // Если совсем нет изображений, добавляем placeholder'ы
    if (productImages.length === 0) {
      for (let i = 0; i < 4; i++) {
        productImages.push(
          `https://img.heroui.chat/image/${
            product?.category || "general"
          }?w=600&h=600&u=${product?.id || "default"}${i}`
        );
      }
    }

    return productImages;
  };

  const howAgoPostedDate = (
    dateString: string,
    t?: (key: string, params?: any) => string
  ) => {
    if (!dateString) return "Дата не указана";

    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();

    // Конвертируем в разные единицы времени
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    // Возвращаем соответствующий текст
    if (diffInMinutes < 1) {
      return t ? t("time.justNow") : "только что";
    } else if (diffInMinutes < 60) {
      return t
        ? t("time.minutesAgo", { count: diffInMinutes })
        : `${diffInMinutes} мин. назад`;
    } else if (diffInHours < 24) {
      return t
        ? t("time.hoursAgo", { count: diffInHours })
        : `${diffInHours} ч. назад`;
    } else if (diffInDays < 7) {
      return t
        ? t("time.daysAgo", { count: diffInDays })
        : `${diffInDays} дн. назад`;
    } else if (diffInWeeks < 4) {
      return t
        ? t("time.weeksAgo", { count: diffInWeeks })
        : `${diffInWeeks} нед. назад`;
    } else if (diffInMonths < 12) {
      return t
        ? t("time.monthsAgo", { count: diffInMonths })
        : `${diffInMonths} мес. назад`;
    } else {
      return t
        ? t("time.yearsAgo", { count: diffInYears })
        : `${diffInYears} г. назад`;
    }
  };

  const registerdAtDate = (dateString: string, locale: string = "ru-RU") => {
    if (!dateString) return "Дата регистрации не указана";

    try {
      const date = new Date(dateString);

      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        return "Некорректная дата";
      }

      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
      });
    } catch (error) {
      return "Ошибка при обработке даты";
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-EN", options);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Функция для добавления отзыва
  const handlePostReview = async (reviewData: {
    content: string;
    rating: number;
  }) => {
    try {
      const newReview = await postReviewProduct(id, reviewData);
      if (newReview) {
        const updatedReviews = [newReview, ...(product?.product_reviews || [])];
        const totalRatings = updatedReviews.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        const newAvgRating = +(totalRatings / updatedReviews?.length).toFixed(
          1
        );

        setProduct(
          (prevProduct) =>
            ({
              ...prevProduct,
              product_reviews: updatedReviews,
              avg_rating: newAvgRating,
            } as ProductTypes)
        );
      } else {
        console.error("Review posting failed");
      }
    } catch (error) {
      console.error("Error posting review:", error);
    } finally {
      setIsReviewModalOpen(false);
    }
  };

  // Функция для обновления продукта
  const handleUpdateProduct = async (values: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_name", values.product_name);
      formData.append("product_price", values.product_price);
      formData.append("product_desc", values.product_desc);
      formData.append("city", values.city);
      formData.append("region", values.region);

      if (values.product_img instanceof File) {
        formData.append("product_img", values.product_img);
      }

      const updatedProduct = await updateProduct(id, formData);
      if (updatedProduct && updatedProduct.data) {
        // Обновляем состояние продукта с новыми данными
        const mappedProduct: ProductTypes = {
          ...updatedProduct.data,
          title: updatedProduct.data?.product_name || "Untitled Product",
          category:
            updatedProduct.data?.product_category_details?.name || "general",
          image: updatedProduct.data?.product_img || "/placeholder-image.jpg",
          location: `${updatedProduct.data?.city || "Unknown city"}, ${
            updatedProduct.data?.region || "Unknown region"
          }`,
          price: parseFloat(updatedProduct.data?.product_price || "0"),
          description:
            updatedProduct.data?.product_desc || "No description available",
          avg_rating:
            updatedProduct.data?.avg_rating || product?.avg_rating || 0,
          sellerInfo: {
            name: updatedProduct.data?.seller?.full_name || "Anonymous",
            rating: parseFloat(updatedProduct.data?.seller?.rate || "4.5"),
            memberSince: updatedProduct.data?.seller?.registered_at
              ? new Date(
                  updatedProduct.data?.seller.registered_at
                ).toLocaleDateString()
              : "Jan 2023",
          },
        };
        setProduct(mappedProduct);
      } else {
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
      setIsUpdateModalOpen(false);
    }
  };

  const handleLikeProduct = async () => {
    try {
      const response = await likeProduct(id);
      if (response) {
        // Переключаем состояние лайка
        setProduct((prevProduct) => {
          if (!prevProduct) return prevProduct;

          const currentLikeStatus = prevProduct.is_liked;
          const newLikeStatus = currentLikeStatus === 1 ? 0 : 1;

          return {
            ...prevProduct,
            is_liked: newLikeStatus,
          };
        });
      } else {
        console.error("Failed to like product");
      }
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  // Функция для удаления продукта
  const handleDeleteProduct = async () => {
    try {
      const response = await deleteProduct(id);
      if (response) {
        window.location.href = "/"; // Перенаправление после удаления
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await getProductDetails(id);
        if (response) {
          // Маппинг данных API к ожидаемому формату UI
          const mappedProduct: ProductTypes = {
            ...response,
            title: response?.product_name || "Untitled Product",
            category: response?.product_category_details?.name || "general",
            image: response?.product_img || "/placeholder-image.jpg",
            location: `${response?.city || "Unknown city"}, ${
              response?.region || "Unknown region"
            }`,
            price: parseFloat(response?.product_price || "0"),
            description: response?.product_desc || "No description available",
            // Вычисляем средний рейтинг если есть отзывы
            avg_rating:
              response?.product_reviews && response.product_reviews.length > 0
                ? +(
                    response.product_reviews.reduce(
                      (acc: number, review: Review) => acc + review.rating,
                      0
                    ) / response.product_reviews.length
                  ).toFixed(1)
                : response?.avg_rating || 0,
            sellerInfo: {
              name: response?.seller?.full_name || "Anonymous",
              rating: parseFloat(response?.seller?.rate || "4.5"),
              memberSince: response?.seller?.registered_at
                ? new Date(response?.seller.registered_at).toLocaleDateString()
                : "Jan 2023",
            },
          };
          setSimilarProducts(response?.similar_products || []);
          setProduct(mappedProduct);
        }
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id, getProductDetails]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await showProfile();
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [showProfile]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-600">Loading</p>
        </div>
      </motion.div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <Icon
          icon="lucide:alert-circle"
          className="text-4xl text-danger mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-default-600 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button
          as={RouteLink}
          to="/"
          color="primary"
          startContent={<Icon icon="lucide:arrow-left" />}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  const productImages = getProductImages();

  // Вычисляем средний рейтинг на основе отзывов
  const avgRating =
    product?.product_reviews && product.product_reviews.length > 0
      ? +(
          product.product_reviews.reduce(
            (acc, review) => acc + review.rating,
            0
          ) / product.product_reviews.length
        ).toFixed(1)
      : product?.avg_rating || 0;

  return (
    <div>
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem as={RouteLink} to="/">
          {t("navigation.home")}
        </BreadcrumbItem>
        <BreadcrumbItem
          as={RouteLink}
          to={`/?category=${
            product?.product_category_details?.category_name || "general"
          }`}
        >
          {product?.product_category_details?.category_name || "general"}
        </BreadcrumbItem>
        <BreadcrumbItem>{product?.title || "Product"}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Основное изображение */}
          <Card className="glass-card border-none overflow-hidden mb-6">
            <CardBody className="p-0 relative">
              <div className="relative aspect-video overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    src={
                      productImages[selectedImageIndex] ||
                      "/placeholder-image.jpg"
                    }
                    alt={`${product?.title || "Product"} - изображение ${
                      selectedImageIndex + 1
                    }`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                </AnimatePresence>

                {/* Навигационные кнопки */}
                {productImages.length > 1 && (
                  <>
                    <Button
                      isIconOnly
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                      variant="flat"
                      size="sm"
                      onClick={handlePrevImage}
                    >
                      <Icon icon="lucide:chevron-left" className="text-white" />
                    </Button>
                    <Button
                      isIconOnly
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                      variant="flat"
                      size="sm"
                      onClick={handleNextImage}
                    >
                      <Icon
                        icon="lucide:chevron-right"
                        className="text-white"
                      />
                    </Button>
                  </>
                )}

                {/* Индикатор изображения */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">
                      {selectedImageIndex + 1} / {productImages.length}
                    </span>
                  </div>
                )}

                {/* AR кнопка */}
                {product?.hasAR && (
                  <Button
                    className="absolute bottom-4 right-4"
                    color="primary"
                    startContent={<Icon icon="lucide:view" />}
                  >
                    View in AR
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Миниатюры */}
          <div className="grid grid-cols-4 gap-2">
            {productImages.slice(0, 4).map((image, i) => (
              <Card
                key={i}
                className={`glass-card border-none overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImageIndex === i
                    ? "ring-2 ring-primary shadow-lg scale-105"
                    : "hover:scale-102 hover:shadow-md"
                }`}
                onClick={() => handleImageSelect(i)}
              >
                <CardBody className="p-0 relative">
                  <img
                    src={image}
                    alt={`${product?.title || "Product"} thumbnail ${i + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                  {selectedImageIndex === i && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Icon
                        icon="lucide:check"
                        className="text-primary text-xl"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}

            {/* Показать больше изображений, если их больше 4 */}
            {productImages.length > 4 && (
              <Card className="glass-card border-none overflow-hidden cursor-pointer hover:scale-102 transition-all">
                <CardBody className="p-0 relative">
                  <img
                    src={productImages[4]}
                    alt="Больше изображений"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Icon icon="lucide:plus" className="text-2xl mb-1" />
                      <span className="text-xs font-medium">
                        +{productImages.length - 4}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Точки-индикаторы для мобильных устройств */}
          {productImages.length > 1 && (
            <div className="flex justify-center mt-4 md:hidden">
              <div className="flex space-x-2">
                {productImages.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImageIndex === i ? "bg-primary" : "bg-default-300"
                    }`}
                    onClick={() => handleImageSelect(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-none mb-6">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold">
                  {product?.title || "Product Name"}
                </h1>
                <Button isIconOnly variant="light" aria-label="Share">
                  <Icon icon="lucide:share" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Icon
                    icon="lucide:map-pin"
                    width={16}
                    height={16}
                    className="text-default-500"
                  />
                  <span className="text-default-500 ml-1">
                    {product?.location || "Location not specified"}
                  </span>
                </div>
                <span className="text-default-400">•</span>
                <span className="text-default-500">
                  {howAgoPostedDate(product?.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6">
                {product?.isNew && (
                  <Chip color="primary" variant="flat">
                    New
                  </Chip>
                )}
                {product?.isHot && (
                  <Chip color="danger" variant="flat">
                    Hot
                  </Chip>
                )}
                {product?.hasAR && (
                  <Chip color="secondary" variant="flat">
                    AR View
                  </Chip>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  ${product?.price?.toLocaleString()}
                </h2>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <Button
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:message-circle" />}
                >
                  {t("product.contactSeller")}
                </Button>
                <Button
                  variant="flat"
                  color={product?.is_liked === 1 ? "danger" : "primary"}
                  size="lg"
                  startContent={
                    <Icon
                      icon={
                        product?.is_liked === 1
                          ? "lucide:heart-filled"
                          : "lucide:heart"
                      }
                    />
                  }
                  onClick={handleLikeProduct} 
                >
                  {product?.is_liked === 1
                    ? t("product.removeFromFavorites")
                    : t("product.saveToFavorites")}
                </Button>

                {/* Кнопки для владельца продукта */}
                {user?.id === Number(product?.seller?.id) && (
                  <>
                    <Button
                      variant="flat"
                      color="warning"
                      size="lg"
                      startContent={<Icon icon="lucide:edit" />}
                      onClick={() => setIsUpdateModalOpen(true)}
                    >
                      Update product
                    </Button>
                    <Button
                      variant="flat"
                      color="danger"
                      size="lg"
                      startContent={<Icon icon="lucide:trash" />}
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      Delete product
                    </Button>
                  </>
                )}

                <Button
                  variant="light"
                  size="lg"
                  startContent={<Icon icon="lucide:flag" />}
                >
                  {t("product.reportListing")}
                </Button>
              </div>

              <Divider className="my-4" />

              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    product?.seller?.profile_image ||
                    `https://img.heroui.chat/image/avatar?w=100&h=100&u=${
                      product?.id || "default"
                    }`
                  }
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="font-semibold">
                    {product?.sellerInfo?.name || t("product.anonymousSeller")}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Icon
                      icon="lucide:star"
                      className="text-yellow-500"
                      width={14}
                      height={14}
                    />
                    <span className="text-sm">
                      {product?.sellerInfo?.rating} •{" "}
                      {registerdAtDate(product?.seller?.registered_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="glass-card border-none">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("product.safetyTips")}
              </h3>
              <ul className="text-default-600 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>{t("product.safetyMeet")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>{t("product.safetyNoAdvance")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>{t("product.safetyCheckItem")}</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs aria-label="Product details" color="primary" className="mb-12">
          <Tab key="description" title={t("product.description")}>
            <Card className="glass-card border-none">
              <CardBody className="p-6">
                <p className="text-default-700 mb-6">
                  {product?.description || "No description available."}
                </p>

                <h3 className="text-lg font-semibold mb-3">
                  {t("product.specifications")}
                </h3>
                {product?.specifications &&
                product.specifications.length > 0 ? (
                  <ul className="space-y-2 mb-6">
                    {product.specifications.map(
                      (spec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon
                            icon="lucide:check"
                            className="text-primary mt-1"
                          />
                          <span>{spec || "No specification details"}</span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-default-500 mb-6">
                    {t("product.noSpecifications")}
                  </p>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="shipping" title={t("product.shippingAndReturns")}>
            <Card className="glass-card border-none">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("product.shippingInfo")}
                </h3>
                <p className="text-default-700 mb-4">
                  This item can be shipped nationwide. Shipping costs are
                  calculated based on your location. Local pickup is also
                  available in {product?.location || "various locations"}.
                </p>

                <h3 className="text-lg font-semibold mb-3">
                  {t("product.returnPolicy")}
                </h3>
                <p className="text-default-700 mb-4">
                  Returns accepted within 14 days of delivery. Item must be in
                  original condition. Buyer is responsible for return shipping
                  costs unless the item was misrepresented.
                </p>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="reviews" title={t("product.reviews")}>
            <Card className="glass-card border-none">
              <CardBody className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{avgRating}</div>
                    <Rating value={avgRating} />
                    <div className="text-sm text-default-500 mt-1">
                      {product?.product_reviews?.length || 0} reviews
                    </div>
                  </div>

                  <Divider orientation="vertical" />

                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const total = product?.product_reviews?.length || 1;
                      const count =
                        product?.product_reviews?.filter(
                          (r: Review) => r.rating === star
                        )?.length || 0;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 mb-1"
                        >
                          <span className="text-sm w-4">{star}</span>
                          <Icon
                            icon="lucide:star"
                            className="text-yellow-500"
                            style={{ fontSize: 14 }}
                          />
                          <div className="flex-1 h-2 bg-default-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  color="primary"
                  variant="flat"
                  className="mb-6"
                  onClick={() => setIsReviewModalOpen(true)}
                  disabled={isSubmitting}
                >
                  Write review
                </Button>

                {/* Модальное окно для написания отзыва */}
                <Modal
                  isOpen={isReviewModalOpen}
                  onOpenChange={setIsReviewModalOpen}
                >
                  <ModalContent>
                    <ModalHeader>Write a Review</ModalHeader>
                    <Formik
                      initialValues={{ content: "", rating: 5 }}
                      validationSchema={ReviewSchema}
                      onSubmit={async (values, { resetForm }) => {
                        setIsSubmitting(true);
                        await handlePostReview(values);
                        resetForm();
                        setIsSubmitting(false);
                      }}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          <ModalBody className="space-y-4">
                            <Field
                              name="rating"
                              type="number"
                              min="0.5"
                              max="5"
                              step="0.5"
                              as={Input}
                              label="Rating (1-5)"
                              status={
                                errors.rating && touched.rating
                                  ? "error"
                                  : "default"
                              }
                              errorMessage={
                                errors.rating && touched.rating && errors.rating
                              }
                              disabled={isSubmitting}
                            />
                            <Field
                              name="content"
                              as={Textarea}
                              label="Your review"
                              placeholder="Tell us about your experience with this product..."
                              status={
                                errors.content && touched.content
                                  ? "error"
                                  : "default"
                              }
                              errorMessage={
                                errors.content &&
                                touched.content &&
                                errors.content
                              }
                              disabled={isSubmitting}
                            />
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              variant="light"
                              onClick={() => setIsReviewModalOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              color="primary"
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </ModalFooter>
                        </Form>
                      )}
                    </Formik>
                  </ModalContent>
                </Modal>

                <Divider className="mb-6" />

                <div className="space-y-6">
                  {product?.product_reviews &&
                  product.product_reviews.length > 0 ? (
                    product.product_reviews.map((review: Review) => (
                      <div key={review.id} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar src={review.user_img} className="w-10 h-10" />
                          <div>
                            <h4 className="font-semibold">
                              {review.full_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Rating value={review.rating} size="sm" />
                              <span className="text-xs text-default-500">
                                • {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-default-700">{review.content}</p>
                      </div>
                    ))
                  ) : (
                    // Fallback если нет отзывов
                    <div className="text-center py-8">
                      <Icon
                        icon="lucide:message-square"
                        className="text-4xl text-default-300 mx-auto mb-2"
                      />
                      <p className="text-default-500">No reviews yet</p>
                      <p className="text-default-400 text-sm">
                        Be the first to write a review for this product
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </motion.div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          {t("product.similarListings")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Используем похожие продукты из API, если есть */}
          {similarProducts && similarProducts.length > 0 ? (
            similarProducts.map((simProduct) => (
              <ProductCard key={simProduct.id} product={simProduct} />
            ))
          ) : (
            // Fallback если нет похожих продуктов
            <div className="col-span-full text-center py-8">
              <Icon
                icon="lucide:package"
                className="text-4xl text-default-300 mx-auto mb-2"
              />
              <p className="text-default-500">No similar products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
