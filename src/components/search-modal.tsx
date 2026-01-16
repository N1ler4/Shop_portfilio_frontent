// components/GlobalSearch.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Input,
  Card,
  Spinner,
  Kbd,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../hooks/useDebounce";
import http from "../config";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "product" | "service" | "auction" | "fm" | "vertical";
  url: string;
  price?: number;
  image?: string;
}

const GlobalSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const history = useHistory();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Функция нормализации запроса
  const normalizeSearchQuery = (query: string) => {
    return query
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Функция для генерации различных вариантов поискового запроса
  const generateSearchVariants = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    
    return [
      trimmed,                                    // Оригинальный
      trimmed.toLowerCase(),                      // Нижний регистр
      trimmed.toUpperCase(),                      // Верхний регистр
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(), // Первая заглавная
      normalizeSearchQuery(trimmed),              // Каждое слово с заглавной
    ].filter((variant, index, array) => array.indexOf(variant) === index); // Убираем дубликаты
  };

  // Универсальная функция поиска с множественными вариантами
  const searchWithVariants = async (endpoint: string, query: string, isVerticals = false) => {
    const variants = generateSearchVariants(query);
    
    for (const variant of variants) {
      try {
        const response = await http.get(`${endpoint}?search=${encodeURIComponent(variant)}`);
        
        // Для verticals возвращается response.data, для остальных response.data.results
        const results = isVerticals ? response.data : response.data.results;
        
        if (results && results.length > 0) {
          return results;
        }
      } catch (error) {
        console.log(`Variant "${variant}" failed for ${endpoint}:`, error);
        continue; // Пробуем следующий вариант
      }
    }
    
    // Если ничего не найдено, возвращаем пустой массив
    return [];
  };

  // Функции поиска для каждого типа
  const searchProducts = async (query: string) => {
    return searchWithVariants('project/products/', query);
  };

  const searchServices = async (query: string) => {
    return searchWithVariants('project/services/', query);
  };

  const searchAuctions = async (query: string) => {
    return searchWithVariants('project/auctions/', query);
  };

  const searchFM = async (query: string) => {
    return searchWithVariants('project/fms/', query);
  };

  const searchVerticals = async (query: string) => {
    return searchWithVariants('project/verticals/', query, true); // true означает что это verticals
  };

  // Основная функция поиска
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {

      // Параллельные запросы ко всем API
      const [products, services, auctions, fm, verticals] = await Promise.all([
        searchProducts(query),
        searchServices(query),
        searchAuctions(query),
        searchFM(query),
        searchVerticals(query),
      ]);


      const allResults = [
        // Продукты
        ...(products || []).map((p) => ({
          id: p.id,
          title: p.product_name || p.name || "Без названия",
          description: p.product_desc || p.description || "",
          category: p.category || "",
          type: "product" as const,
          url: `/product/${p.id}`,
          price: p.product_price ? Number(p.product_price) : undefined,
          image: p.product_img || p.image,
        })),

        // Услуги
        ...(services || []).map((s) => ({
          id: s.id,
          title: s.serv_name || "Без названия",
          description: s.serv_desc || "",
          category: s.serv_category_details?.serv_category_name || "",
          type: "service" as const,
          url: `/service/${s.id}`,
          price: s.serv_price ? Number(s.serv_price) : undefined,
          image: s.serv_img,
        })),

        // Аукционы
        ...(auctions || []).map((a) => ({
          id: a.id,
          title: a.auct_name || a.name || "Без названия",
          description: a.auct_desc || a.description || "",
          category: a.auct_category?.auct_category_name || "",
          type: "auction" as const,
          url: `/auction/${a.id}`,
          price: a.current_price ? Number(a.current_price) : undefined,
          image: a.auct_img,
        })),

        // FM
        ...(fm || []).map((f) => ({
          id: f.id,
          title: f.fm_name || f.name || "Без названия",
          description: f.fm_work_title || f.description || "",
          category: f.fm_category_details?.fm_category_name || "",
          type: "fm" as const,
          url: `/fm/${f.id}`,
          price: undefined, // У FM обычно нет цены
          image: f.fm_img,
        })),

        // Вертикали
        ...(verticals || []).map((v) => ({
          id: v.id,
          title: v.vr_name || v.name || "Без названия",
          description: v.vr_desc || v.description || "",
          category: v.vr_category_details?.vr_category_name || "",
          type: "vertical" as const,
          url: `/vertical/${v.id}`,
          price: v.vr_price ? Number(v.vr_price) : undefined,
          image: v.vr_img,
        })),
      ];

      setResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  // Навигация с клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Сброс выбранного индекса при изменении результатов
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    history.push(result.url);
    onClose();
    setSearchQuery("");
    setResults([]);
  };

  // Функции для стилизации типов
  const getTypeBackground = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "service":
        return "bg-green-100 dark:bg-green-900/30";
      case "auction":
        return "bg-purple-100 dark:bg-purple-900/30";
      case "fm":
        return "bg-orange-100 dark:bg-orange-900/30";
      case "vertical":
        return "bg-pink-100 dark:bg-pink-900/30";
      default:
        return "bg-default-100";
    }
  };

  const getTypeIconColor = (type: string) => {
    switch (type) {
      case "product":
        return "text-blue-600 dark:text-blue-400";
      case "service":
        return "text-green-600 dark:text-green-400";
      case "auction":
        return "text-purple-600 dark:text-purple-400";
      case "fm":
        return "text-orange-600 dark:text-orange-400";
      case "vertical":
        return "text-pink-600 dark:text-pink-400";
      default:
        return "text-default-600";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      case "service":
        return "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "auction":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
      case "fm":
        return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "vertical":
        return "bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800";
      default:
        return "bg-default-500/15 text-default-700 dark:text-default-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return "lucide:package";
      case "service":
        return "lucide:wrench";
      case "auction":
        return "lucide:gavel";
      case "fm":
        return "lucide:zap";
      case "vertical":
        return "lucide:layers";
      default:
        return "lucide:search";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Товар";
      case "service":
        return "Услуга";
      case "auction":
        return "Аукцион";
      case "fm":
        return "FM";
      case "vertical":
        return "Вертикаль";
      default:
        return type;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="top"
      hideCloseButton
      classNames={{
        base: "mt-20",
        backdrop: "backdrop-blur-sm",
      }}
    >
      <ModalContent>
        <ModalBody className="p-0">
          <div className="relative">
            <Input
              autoFocus
              placeholder="Поиск по всему сайту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={
                <Icon
                  icon="lucide:search"
                  className="text-default-400"
                  width={20}
                />
              }
              endContent={
                <div className="flex items-center gap-2">
                  {loading && <Spinner size="sm" />}
                  <Kbd keys={["escape"]}>ESC</Kbd>
                </div>
              }
              classNames={{
                base: "p-4",
                input: "text-lg",
                inputWrapper: "bg-transparent shadow-none",
              }}
            />
          </div>

          {/* Результаты поиска */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery && !loading && results.length === 0 && (
              <div className="p-8 text-center text-default-400">
                <Icon
                  icon="lucide:search-x"
                  className="mx-auto mb-4"
                  width={48}
                />
                <p>Ничего не найдено по запросу "{searchQuery}"</p>
              </div>
            )}

            <AnimatePresence>
              {results.length > 0 && (
                <div className="p-3 space-y-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        isPressable
                        onPress={() => handleResultClick(result)}
                        className={`p-0 cursor-pointer transition-all duration-200 w-full max-h-[150px] ${
                          index === selectedIndex
                            ? "bg-primary/5 border-primary/30 shadow-lg ring-2 ring-primary/20"
                            : "hover:bg-content2/50 hover:shadow-md border-transparent"
                        }`}
                      >
                        <div className="flex items-center p-4 gap-4">
                          {/* Изображение или иконка */}
                          <div className="relative shrink-0">
                            {result.image ? (
                              <div className="relative">
                                <img
                                  src={result.image}
                                  alt={result.title}
                                  className="w-16 h-16 object-cover rounded-xl"
                                />
                                {/* Маленький индикатор типа на изображении */}
                                <div
                                  className={`
                                    absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
                                    ${getTypeBackground(result.type)} border-2 border-background
                                  `}
                                >
                                  <Icon
                                    icon={getTypeIcon(result.type)}
                                    className={getTypeIconColor(result.type)}
                                    width={12}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`
                                  flex items-center justify-center w-16 h-16 rounded-xl
                                  ${getTypeBackground(result.type)}
                                `}
                              >
                                <Icon
                                  icon={getTypeIcon(result.type)}
                                  className={getTypeIconColor(result.type)}
                                  width={28}
                                />
                              </div>
                            )}
                          </div>

                          {/* Основная информация */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Тип и категория */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`
                                  text-xs font-semibold px-2.5 py-1 rounded-full
                                  ${getTypeBadge(result.type)}
                                `}
                              >
                                {getTypeLabel(result.type)}
                              </span>
                              {result.category && (
                                <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded-full max-w-32 truncate">
                                  {result.category}
                                </span>
                              )}
                            </div>

                            {/* Название */}
                            <h4 className="font-bold text-foreground text-base leading-tight line-clamp-1">
                              {result.title}
                            </h4>

                            {/* Описание */}
                            {result.description && (
                              <p className="text-sm text-default-600 line-clamp-2 leading-relaxed">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Правая часть - цена и стрелка */}
                          <div className="flex flex-col items-end justify-between h-16 shrink-0">
                            {/* Цена */}
                            {result.price && (
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {result.price.toLocaleString('ru-RU')} $
                                </p>
                              </div>
                            )}

                            {/* Стрелка */}
                            <div
                              className={`
                                flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                                ${
                                  index === selectedIndex
                                    ? "bg-primary/10 text-primary"
                                    : "bg-default-100 text-default-400 group-hover:bg-default-200"
                                }
                              `}
                            >
                              <Icon
                                icon="lucide:arrow-right"
                                className={`
                                  transition-transform duration-200
                                  ${index === selectedIndex ? "translate-x-0.5" : ""}
                                `}
                                width={16}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Подсказки */}
          {!searchQuery && (
            <div className="p-6 border-t border-content2">
              <p className="text-sm text-default-400 mb-3">
                Популярные запросы:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Ремонт", "Доставка", "Электроника", "Услуги"].map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant="flat"
                    onPress={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GlobalSearch;