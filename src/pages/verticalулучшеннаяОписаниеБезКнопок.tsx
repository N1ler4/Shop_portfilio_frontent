import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Avatar, Modal, ModalContent, ModalBody, ModalHeader, useDisclosure, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { CategorySelector } from "../components/category-selector";
import { LocationFilter } from "../components/location-filter";

interface VerticalAd {
  id: string;
  title: string;
  price: number;
  seller: {
    name: string;
    avatar: string;
  };
  media: string;
  description: string;
  category: string;
}

const fakeVerticalAds: VerticalAd[] = [
  {
    id: "1",
    title: "Стильные кроссовки Nike Air Max",
    price: 12999,
    seller: {
      name: "СпортМастер",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=1",
    },
    media: "https://img.heroui.chat/image/shoes?w=1080&h=1920&u=1",
    description: "Новая коллекция Nike Air Max. Комфорт и стиль в каждом шаге!",
    category: "Обувь",
  },
  {
    id: "2",
    title: "iPhone 13 Pro - Идеальное состояние",
    price: 79999,
    seller: {
      name: "Алексей",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=2",
    },
    media: "https://img.heroui.chat/image/electronics?w=1080&h=1920&u=3",
    description: "iPhone 13 Pro, 256GB, цвет - графитовый. Использовался 3 месяца, состояние нового.",
    category: "Электроника",
  },
  {
    id: "3",
    title: "Уютная квартира в центре",
    price: 5500000,
    seller: {
      name: "Агентство Недвижимости",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=3",
    },
    media: "https://img.heroui.chat/image/places?w=1080&h=1920&u=5",
    description: "2-комнатная квартира, 60 кв.м, свежий ремонт, вид на парк. Отличное расположение!",
    category: "Недвижимость",
  },
  {
    id: "4",
    title: "Велосипед горный Scott Scale 970",
    price: 89999,
    seller: {
      name: "ВелоМир",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=4",
    },
    media: "https://img.heroui.chat/image/sports?w=1080&h=1920&u=7",
    description: "Отличный горный велосипед для любителей активного отдыха. Легкая алюминиевая рама, 29-дюймовые колеса.",
    category: "Спорт и отдых",
  },
  {
    id: "5",
    title: "Кофемашина De'Longhi Magnifica S",
    price: 34999,
    seller: {
      name: "ТехноДом",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=5",
    },
    media: "https://img.heroui.chat/image/food?w=1080&h=1920&u=9",
    description: "Автоматическая кофемашина для истинных ценителей кофе. Встроенная кофемолка, капучинатор.",
    category: "Бытовая техника",
  },
  {
    id: "v5",
    title: "Винтажный велосипед",
    price: 15000,
    description: "Классический велосипед 1960-х годов в отличном состоянии.",
    media: "https://img.heroui.chat/image/sports?w=800&h=1000&u=5",
    seller: {
      name: "Алексей",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=5"
    },
    category: "Велосипеды"
  },
  {
    id: "v6",
    title: "Коллекционные марки",
    price: 5000,
    description: "Редкая коллекция почтовых марок со всего мира.",
    media: "https://img.heroui.chat/image/book?w=800&h=1000&u=6",
    seller: {
      name: "Марина",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=6"
    },
    category: "Коллекционирование"
  },
  {
    id: "v7",
    title: "Игровая приставка PS5",
    price: 45000,
    description: "Новая PlayStation 5 с дополнительным геймпадом.",
    media: "https://img.heroui.chat/image/game?w=800&h=1000&u=7",
    seller: {
      name: "Игорь",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=7"
    },
    category: "Электроника"
  },
  {
    id: "8",
    title: "Apple Watch Series 8",
    price: 29999,
    seller: {
      name: "Тимур",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=8",
    },
    media: "https://img.heroui.chat/image/electronics?w=1080&h=1920&u=8",
    description: "Новые Apple Watch, гарантия 1 год, полный комплект.",
    category: "Электроника",
  },
  {
    id: "9",
    title: "Кожаная куртка мужская",
    price: 12000,
    seller: {
      name: "Рустам",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=9",
    },
    media: "https://img.heroui.chat/image/fashion?w=1080&h=1920&u=9",
    description: "Стильная кожаная куртка, размер L, почти новая.",
    category: "Одежда",
  },
  {
    id: "10",
    title: "Детский велосипед",
    price: 7000,
    seller: {
      name: "Светлана",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=10",
    },
    media: "https://img.heroui.chat/image/sports?w=1080&h=1920&u=10",
    description: "Яркий велосипед для детей 5-8 лет, отличное состояние.",
    category: "Велосипеды",
  },
  {
    id: "11",
    title: "Планшет Samsung Tab S8",
    price: 45000,
    seller: {
      name: "Денис",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=11",
    },
    media: "https://img.heroui.chat/image/electronics?w=1080&h=1920&u=11",
    description: "Мощный планшет для работы и развлечений, 128GB, Wi-Fi.",
    category: "Электроника",
  },
  {
    id: "12",
    title: "Диван-кровать IKEA",
    price: 25000,
    seller: {
      name: "Мария",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=12",
    },
    media: "https://img.heroui.chat/image/furniture?w=1080&h=1920&u=12",
    description: "Удобный диван-кровать, почти новый, современный дизайн.",
    category: "Мебель",
  },
  {
    id: "13",
    title: "Горный велосипед Trek",
    price: 38000,
    seller: {
      name: "Владимир",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=13",
    },
    media: "https://img.heroui.chat/image/sports?w=1080&h=1920&u=13",
    description: "Trek X-Caliber, 2022 год, отличное состояние, 29 дюймов.",
    category: "Велосипеды",
  },
  {
    id: "14",
    title: "Пальто женское Zara",
    price: 9000,
    seller: {
      name: "Екатерина",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=14",
    },
    media: "https://img.heroui.chat/image/fashion?w=1080&h=1920&u=14",
    description: "Элегантное пальто, размер S, носилось 1 сезон.",
    category: "Одежда",
  },
  {
    id: "15",
    title: "Смарт-телевизор LG 55''",
    price: 67000,
    seller: {
      name: "Олег",
      avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=15",
    },
    media: "https://img.heroui.chat/image/electronics?w=1080&h=1920&u=15",
    description: "4K UHD, Smart TV, отличное изображение, гарантия.",
    category: "Электроника",
  },
];

const VerticalPage: React.FC = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [location, setLocation] = useState({ region: "", city: "", district: "" });

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % fakeVerticalAds.length);
    } else {
      setCurrentAdIndex((prevIndex) => (prevIndex - 1 + fakeVerticalAds.length) % fakeVerticalAds.length);
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
      handleSwipe('up');
    } else if (isDownSwipe) {
      handleSwipe('down');
    }
  };

  const currentAd = fakeVerticalAds[currentAdIndex];

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden flex justify-center items-center"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar fixed at the bottom */}
      <aside className="hidden lg:flex flex-col gap-6 glass-card shadow-2xl rounded-2xl p-6 w-[240px] h-[80vh] mb-6 mx-8 z-40 fixed left-0 right-auto bottom-0">
        {/* Custom styled vertical CategorySelector for sidebar */}
        <div className="flex flex-col gap-1">
          {[
            { key: "electronics", icon: "lucide:smartphone", label: "Электроника" },
            { key: "furniture", icon: "lucide:sofa", label: "Мебель" },
            { key: "clothing", icon: "lucide:shirt", label: "Одежда" },
            { key: "vehicles", icon: "lucide:car", label: "Транспорт" },
            { key: "services", icon: "lucide:wrench", label: "Услуги" },
            { key: "realestate", icon: "lucide:home", label: "Недвижимость" },
            { key: "jobs", icon: "lucide:briefcase", label: "Работа" },
            { key: "agriculture", icon: "lucide:wheat", label: "Сельское хоз." },
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-left text-sm font-normal
                ${selectedCategory === category.key
                  ? 'bg-primary/10 text-primary shadow-md'
                  : 'hover:bg-content2/40 text-default-700'}
              `}
              style={{ outline: 'none', border: 'none', background: 'none' }}
            >
              <Icon icon={category.icon} width={22} height={22} className={selectedCategory === category.key ? 'text-primary' : 'text-default-500'} />
              <span className="truncate">{category.label}</span>
            </button>
          ))}
        </div>
        <LocationFilter onLocationChange={setLocation} />
      </aside>

      {/* Main content */}
      {/* ИЗМЕНЕНИЕ: Родительский контейнер теперь имеет lg:gap-6 для отступа */}
      <div className="flex flex-row items-end w-full max-w-full justify-center mt-20 lg:gap-6">
        
        {/* ИЗМЕНЕНИЕ: Блок с описанием теперь находится здесь, слева от объявления */}
        <div className="hidden lg:flex flex-col justify-end min-w-[260px] max-w-[300px] h-full pb-0" style={{height: '100%'}}>
          <div className="bg-black/60 rounded-2xl p-4 mb-0 shadow-lg w-full" style={{minHeight: 120}}>
            <h2 className="text-white text-lg font-bold mb-1 truncate">{currentAd.title}</h2>
            <p className="text-white text-base font-semibold mb-1">{currentAd.price} ₽</p>
            <p className="text-white text-xs mb-2 line-clamp-2">{currentAd.description}</p>
            <div className="flex items-center gap-2">
              <Avatar src={currentAd.seller.avatar} alt={currentAd.seller.name} className="w-7 h-7 border-2 border-white" />
              <span className="text-white text-sm font-medium truncate">{currentAd.seller.name}</span>
            </div>
          </div>
        </div>

        {/* Объявление (Фото/видео) */}
        {/* Этот блок теперь расположен справа от описания на ПК */}
        <div
          className="relative flex flex-col items-center justify-center h-full w-full max-w-[330px] mx-auto lg:mx-0 lg:static lg:max-w-[330px] lg:h-full lg:bg-transparent lg:rounded-2xl lg:shadow-2xl"
          onWheel={(e) => {
            if (window.innerWidth >= 1024) {
              if (e.deltaY > 0) setCurrentAdIndex((prev) => (prev + 1) % fakeVerticalAds.length);
              else if (e.deltaY < 0) setCurrentAdIndex((prev) => (prev - 1 + fakeVerticalAds.length) % fakeVerticalAds.length);
            }
          }}
          style={{ minHeight: 400, maxHeight: 462 }}
        >
          {/* Exit button outside top-right of ad */}
          <div className="hidden lg:block absolute top-0 right-[-60px] z-40">
            <Link to="/">
              <Button isIconOnly variant="flat" color="default" className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition">
                <Icon icon="lucide:x" className="text-white" width={24} height={24} />
              </Button>
            </Link>
          </div>
          <AnimatePresence initial={false}>
            <motion.div
              key={currentAdIndex}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full aspect-[9/13.68] max-w-[330px] mx-auto relative flex justify-center items-center"
            >
              <img
                src={currentAd.media}
                alt={currentAd.title}
                className="w-full h-full object-cover lg:rounded-2xl lg:shadow-2xl fixed inset-0 z-10 bg-black lg:static"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/80 rounded-2xl" />
              {/* Bottom info block (только для мобильных, TikTok style) */}
              <div className="absolute bottom-0 left-0 w-full px-4 pb-6 z-20 bg-black/60 rounded-t-2xl flex flex-col gap-2 lg:hidden">
                <h2 className="text-white text-lg font-bold mb-0.5 truncate">{currentAd.title}</h2>
                <p className="text-white text-base font-semibold mb-0.5">{currentAd.price} ₽</p>
                <p className="text-white text-xs mb-1 line-clamp-2">{currentAd.description}</p>
                <div className="flex items-center gap-2">
                  <Avatar src={currentAd.seller.avatar} alt={currentAd.seller.name} className="w-7 h-7 border-2 border-white" />
                  <span className="text-white text-sm font-medium truncate">{currentAd.seller.name}</span>
                </div>
              </div>
              {/* Action buttons (только для мобильных, TikTok style) */}
              <div className="flex flex-col gap-4 z-30 absolute top-1/2 right-4 -translate-y-1/2 items-center lg:hidden">
                <Button isIconOnly variant="flat" color="default" className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition">
                  <Icon icon="lucide:heart" className="text-white" width={26} height={26} />
                </Button>
                <Button isIconOnly variant="flat" color="default" className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition" onPress={onOpen}>
                  <Icon icon="lucide:message-circle" className="text-white" width={26} height={26} />
                </Button>
                <Button isIconOnly variant="flat" color="default" className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition">
                  <Icon icon="lucide:share" className="text-white" width={26} height={26} />
                </Button>
              </div>
              {/* Exit button (только для мобильных) */}
              <div className="flex lg:hidden absolute top-4 right-4 z-40">
                <Link to="/">
                  <Button isIconOnly variant="flat" color="default" className="bg-white/20 shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition">
                    <Icon icon="lucide:x" className="text-white" width={22} height={22} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Floating action buttons - outside but close to right edge of ad */}
          <div className="hidden lg:flex flex-col gap-4 z-30 absolute top-1/2 right-[-60px] -translate-y-1/2 items-center">
            <Button 
              isIconOnly 
              variant="flat" 
              color="default"
              className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition"
            >
              <Icon icon="lucide:heart" className="text-white" width={26} height={26} />
            </Button>
            <Button 
              isIconOnly 
              variant="flat" 
              color="default"
              className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition"
              onPress={onOpen}
            >
              <Icon icon="lucide:message-circle" className="text-white" width={26} height={26} />
            </Button>
            <Button 
              isIconOnly 
              variant="flat" 
              color="default"
              className="bg-white/20 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition"
            >
              <Icon icon="lucide:share" className="text-white" width={26} height={26} />
            </Button>
            {/* Scroll buttons for PC (vertical, under action buttons) */}
            <Button
              isIconOnly
              variant="flat"
              color="default"
              className="bg-white/20 shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition mt-2"
              onClick={() => setCurrentAdIndex((prev) => (prev - 1 + fakeVerticalAds.length) % fakeVerticalAds.length)}
            >
              <Icon icon="lucide:chevron-up" className="text-white" width={22} height={22} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              color="default"
              className="bg-white/20 shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition"
              onClick={() => setCurrentAdIndex((prev) => (prev + 1) % fakeVerticalAds.length)}
            >
              <Icon icon="lucide:chevron-down" className="text-white" width={22} height={22} />
            </Button>
          </div>
        </div>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          scrollBehavior="inside"
          className="bg-white/10 backdrop-blur-md"
          size="md"
          placement="center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Чат с продавцом
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar src={currentAd.seller.avatar} alt={currentAd.seller.name} />
                      <div>
                        <p className="font-semibold">{currentAd.seller.name}</p>
                        <p className="text-sm text-gray-500">Онлайн</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg self-start max-w-[80%]">
                        <p>Здравствуйте! Чем могу помочь?</p>
                      </div>
                      <div className="bg-primary/20 backdrop-blur-md p-2 rounded-lg self-end max-w-[80%]">
                        <p>Добрый день! Интересует {currentAd.title}. Можно узнать подробнее?</p>
                      </div>
                    </div>
                    <Input
                      placeholder="Введите сообщение..."
                      endContent={
                        <Button isIconOnly size="sm" variant="flat">
                          <Icon icon="lucide:send" />
                        </Button>
                      }
                      className="bg-white/10 backdrop-blur-md"
                    />
                  </div>
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