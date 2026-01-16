import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Chip,
  Divider,
  Card,
  CardBody,
  CheckboxGroup,
  Checkbox,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { CategorySelector } from "../components/category-selector";
import { ProductCard } from "../components/product-card";
import { FeaturedSection } from "../components/featured-section";
import { LocationFilter } from "../components/location-filter";
import { useLocation } from "../context/LocationContext";
import useProductStore from "../store/product";

// Типы для фильтров
interface PriceFilter {
  min: string;
  max: string;
}

interface Filters {
  price: PriceFilter;
  condition: string[];
  sellerType: string[];
  delivery: string[];
  publishedPeriod: string;
}

// API Response interface
interface APIProduct {
  id: number;
  seller: {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    company_name?: string;
    // ... другие поля продавца
  };
  product_category_details: {
    id: number;
    category_name: string;
    category_icon?: string;
  };
  product_name: string;
  product_price: string;
  product_tags: string[];
  product_desc: string;
  product_safety: string[];
  region: string;
  city: string;
  district: string;
  product_img: string;
  created_at: string;
  isHot: boolean;
  hasAR: boolean;
  isNew: boolean;
  seller_type: "individual" | "company";
  delivery: "delivery" | "pickup" | "both";
}

// Product interface для UI (соответствует ProductCard)
export interface Product {
  id: string;
  product_name: string;
  product_price: number;
  city: string;
  region: string;
  product_img: string;
  category: string;
  hasAR: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

export const HomePage: React.FC = () => {
  const { location } = useLocation();
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { getProducts } = useProductStore();

  // Состояние для фильтров
  const [filters, setFilters] = useState<Filters>({
    price: { min: "", max: "" },
    condition: [], // isNew true/false
    sellerType: [], // individual/company
    delivery: [], // delivery/pickup
    publishedPeriod: "all",
  });

  // Функция для преобразования API данных в UI формат
  const transformProducts = (apiProducts: APIProduct[]): Product[] => {
    return apiProducts.map(apiProduct => ({
      id: apiProduct.id.toString(),
      product_name: apiProduct.product_name,
      product_price: parseFloat(apiProduct.product_price),
      city: apiProduct.city,
      region: apiProduct.region,
      product_img: apiProduct.product_img,
      category: apiProduct.product_category_details.category_name,
      hasAR: apiProduct.hasAR,
      isNew: apiProduct.isNew,
      isHot: apiProduct.isHot,
    }));
  };

  // Получение продуктов
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (response) {
          setApiProducts(response.results);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [getProducts]);

  // Функция для фильтрации продуктов
  const filteredProducts = useMemo(() => {
    let filtered = apiProducts;

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.product_category_details.id.toString() === selectedCategory
      );
    }

    // Фильтр по цене
    if (filters.price.min || filters.price.max) {
      const minPrice = parseFloat(filters.price.min) || 0;
      const maxPrice = parseFloat(filters.price.max) || Infinity;
      
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.product_price);
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Фильтр по состоянию (новое/б/у)
    if (filters.condition.length > 0) {
      filtered = filtered.filter((product) => {
        if (filters.condition.includes("new") && product.isNew) {
          return true;
        }
        if (filters.condition.includes("used") && !product.isNew) {
          return true;
        }
        return false;
      });
    }

    // Фильтр по типу продавца
    if (filters.sellerType.length > 0) {
      
      filtered = filtered.filter((product) => {
        // Используем поле seller_type напрямую
        return filters.sellerType.includes(product.seller_type);
      });
    }

    // Фильтр по доставке
    if (filters.delivery.length > 0) {
      filtered = filtered.filter((product) => {
        if (filters.delivery.includes("delivery") && 
            (product.delivery === "delivery" || product.delivery === "both")) {
          return true;
        }
        if (filters.delivery.includes("pickup") && 
            (product.delivery === "pickup" || product.delivery === "both")) {
          return true;
        }
        return false;
      });
    }

    // Фильтр по дате публикации
    if (filters.publishedPeriod !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.publishedPeriod) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((product) => {
        const productDate = new Date(product.created_at);
        return productDate >= startDate;
      });
    }

    // Преобразуем отфильтрованные API данные в UI формат
    return transformProducts(filtered);
  }, [apiProducts, selectedCategory, filters]);

  // Обработчики для изменения фильтров
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceChange = (field: keyof PriceFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (
    filterType: keyof Omit<Filters, 'price' | 'publishedPeriod'>,
    values: string[]
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const handlePublishedPeriodChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      publishedPeriod: value
    }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      price: { min: "", max: "" },
      condition: [],
      sellerType: [],
      delivery: [],
      publishedPeriod: "all",
    });
    setSelectedCategory("all");
  };

  // Применение фильтров (можно использовать для дополнительной логики)
  const applyFilters = () => {
    // Здесь можно добавить дополнительную логику,
    // например, отправку аналитики или сохранение в localStorage
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Найдите то, что ищете</h1>
        <p className="text-default-600 text-lg">
          Современная площадка для покупок и продаж
        </p>
      </motion.div>

      <CategorySelector onCategoryChange={handleCategoryChange} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <LocationFilter />

          <Card className="glass-card border-none mb-8">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Фильтры</h3>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={resetFilters}
                >
                  Сбросить
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Цена</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="От"
                      size="sm"
                      value={filters.price.min}
                      onValueChange={(value) => handlePriceChange("min", value)}
                      startContent={<span className="text-default-400">₽</span>}
                    />
                    <Input
                      placeholder="До"
                      size="sm"
                      value={filters.price.max}
                      onValueChange={(value) => handlePriceChange("max", value)}
                      startContent={<span className="text-default-400">₽</span>}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Состояние</h4>
                  <CheckboxGroup
                    value={filters.condition}
                    onValueChange={(values) => handleCheckboxChange("condition", values)}
                  >
                    <Checkbox value="new">Новое</Checkbox>
                    <Checkbox value="used">Б/у</Checkbox>
                  </CheckboxGroup>
                </div>

                <Divider className="my-2" />

                <div>
                  <h4 className="text-sm font-medium mb-2">Тип продавца</h4>
                  <CheckboxGroup
                    value={filters.sellerType}
                    onValueChange={(values) => handleCheckboxChange("sellerType", values)}
                  >
                    <Checkbox value="individual">Частное лицо</Checkbox>
                    <Checkbox value="company">Компания</Checkbox>
                  </CheckboxGroup>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Доставка</h4>
                  <CheckboxGroup
                    value={filters.delivery}
                    onValueChange={(values) => handleCheckboxChange("delivery", values)}
                  >
                    <Checkbox value="delivery">С доставкой</Checkbox>
                    <Checkbox value="pickup">Самовывоз</Checkbox>
                  </CheckboxGroup>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Опубликовано</h4>
                  <Select 
                    size="sm" 
                    placeholder="Выберите период"
                    selectedKeys={[filters.publishedPeriod]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      handlePublishedPeriodChange(value);
                    }}
                  >
                    <SelectItem key="today">Сегодня</SelectItem>
                    <SelectItem key="week">За неделю</SelectItem>
                    <SelectItem key="month">За месяц</SelectItem>
                    <SelectItem key="all">За всё время</SelectItem>
                  </Select>
                </div>

                <Button color="primary" className="w-full" onPress={applyFilters}>
                  Применить фильтры
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <FeaturedSection />

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Рекомендуемые объявления</h2>
                <p className="text-sm text-default-500">
                  Найдено {filteredProducts.length} объявлений
                </p>
              </div>
              <Button
                variant="light"
                color="primary"
                endContent={<Icon icon="lucide:arrow-right" />}
              >
                Смотреть все
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Icon
                    icon="lucide:search-x"
                    className="text-4xl text-default-300 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-medium mb-2">
                    Объявления не найдены
                  </h3>
                  <p className="text-default-500 mb-6">
                    Попробуйте изменить параметры фильтрации или сбросить фильтры.
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={resetFilters}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Divider className="my-12" />

          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Рядом с вами</h2>
                <div className="flex items-center gap-1 text-default-500">
                  <Icon icon="lucide:map-pin" style={{ fontSize: 16 }} />
                  <span>
                    {location.region !== "Все регионы"
                      ? `${location.region}${
                          location.city !== "Выберите город"
                            ? `, ${location.city}`
                            : ""
                        }`
                      : "Выберите регион для локальных рекомендаций"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {transformProducts(apiProducts).slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};