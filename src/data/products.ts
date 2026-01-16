export const products = [
  // Electronics
  {
    id: "e1",
    title: "iPhone 14 Pro - 256GB - Excellent Condition",
    price: 899.99,
    location: "Ташкент, Мирзо-Улугбекский",
    image: "https://img.heroui.chat/image/electronics?w=600&h=400&u=2",
    category: "electronics",
    hasAR: false,
    isHot: true,
    description: "Apple iPhone 14 Pro в отличном состоянии. 256GB памяти, разблокирован для всех операторов. В комплекте оригинальная коробка, зарядное устройство и AppleCare+ до декабря 2024."
  },
  {
    id: "e2",
    title: "Samsung 65\" QLED 4K Smart TV",
    price: 899.99,
    location: "Ташкент, Чиланзарский",
    image: "https://img.heroui.chat/image/electronics?w=600&h=400&u=6",
    category: "electronics",
    hasAR: true,
    isNew: true,
    description: "Samsung 65-дюймовый QLED 4K Smart TV. Идеальное качество изображения с Quantum HDR. Умные функции со встроенными голосовыми помощниками. Куплен 3 месяца назад, продаю в связи с переездом."
  },
  {
    id: "e3",
    title: "MacBook Pro 16\" M2 Pro 32GB RAM",
    price: 2499.99,
    location: "Ташкент, Юнусабадский",
    image: "https://img.heroui.chat/image/electronics?w=600&h=400&u=10",
    category: "electronics",
    hasAR: false,
    isNew: true,
    description: "Новый MacBook Pro 16 дюймов с чипом M2 Pro, 32GB RAM и 1TB SSD. Идеальное состояние, на гарантии Apple."
  },
  {
    id: "e4",
    title: "Sony WH-1000XM5 Наушники",
    price: 349.99,
    location: "Самарканд, Центральный",
    image: "https://img.heroui.chat/image/electronics?w=600&h=400&u=11",
    category: "electronics",
    hasAR: false,
    description: "Беспроводные наушники Sony WH-1000XM5 с шумоподавлением. Использовались всего месяц, полный комплект."
  },
  
  // Furniture
  {
    id: "f1",
    title: "Modern Ergonomic Office Chair",
    price: 299.99,
    location: "Ташкент, Алмазарский",
    image: "https://img.heroui.chat/image/furniture?w=600&h=400&u=1",
    category: "furniture",
    hasAR: true,
    isNew: true,
    description: "Испытайте непревзойденный комфорт с этим эргономичным офисным креслом, разработанным для длительной работы. Имеет регулируемую высоту, поддержку поясницы и дышащую сетчатую спинку."
  },
  {
    id: "f2",
    title: "Vintage Mid-Century Coffee Table",
    price: 349.99,
    location: "Бухара, Восточный",
    image: "https://img.heroui.chat/image/furniture?w=600&h=400&u=7",
    category: "furniture",
    hasAR: true,
    description: "Аутентичный журнальный столик в стиле mid-century modern в отличном состоянии. Массив ореха с оригинальной отделкой. Идеальный центральный элемент для любой гостиной."
  },
  {
    id: "f3",
    title: "Кухонный гарнитур современный",
    price: 1200.00,
    location: "Ташкент, Яшнабадский",
    image: "https://img.heroui.chat/image/furniture?w=600&h=400&u=20",
    category: "furniture",
    hasAR: true,
    description: "Современный кухонный гарнитур, длина 3 метра. Фасады - МДФ, столешница - искусственный камень. Встроенная мойка и смеситель в комплекте."
  },
  {
    id: "f4",
    title: "Шкаф-купе с зеркалом",
    price: 450.00,
    location: "Наманган",
    image: "https://img.heroui.chat/image/furniture?w=600&h=400&u=21",
    category: "furniture",
    hasAR: true,
    isHot: true,
    description: "Шкаф-купе с зеркальными дверями, ширина 2м, высота 2.4м, глубина 60см. Много отделений и полок внутри."
  },
  
  // Clothing
  {
    id: "c1",
    title: "Designer Leather Jacket - Size M",
    price: 199.99,
    location: "Ташкент, Сергелийский",
    image: "https://img.heroui.chat/image/clothing?w=600&h=400&u=3",
    category: "clothing",
    hasAR: true,
    description: "Кожаная куртка в отличном состоянии. Размер M, соответствует размеру. Идеально для осени и зимы. Минимальный износ, без повреждений."
  },
  {
    id: "c2",
    title: "Мужской костюм Brioni",
    price: 799.99,
    location: "Ташкент, Мирабадский",
    image: "https://img.heroui.chat/image/clothing?w=600&h=400&u=30",
    category: "clothing",
    hasAR: true,
    description: "Мужской костюм Brioni, размер 50, цвет темно-синий. Одевался один раз на мероприятие. Идеальное состояние."
  },
  {
    id: "c3",
    title: "Женское платье вечернее",
    price: 120.00,
    location: "Самарканд",
    image: "https://img.heroui.chat/image/clothing?w=600&h=400&u=31",
    category: "clothing",
    hasAR: true,
    isNew: true,
    description: "Вечернее платье, размер 44-46, цвет бордовый. Новое с бирками, не подошел размер."
  },
  {
    id: "c4",
    title: "Кроссовки Nike Air Max",
    price: 85.00,
    location: "Фергана",
    image: "https://img.heroui.chat/image/shoes?w=600&h=400&u=1",
    category: "clothing",
    hasAR: false,
    description: "Кроссовки Nike Air Max, размер 42, оригинал. Состояние 9/10, носились несколько раз."
  },
  
  // Vehicles
  {
    id: "v1",
    title: "2019 Tesla Model 3 - Long Range",
    price: 39999.99,
    location: "Ташкент, Яккасарайский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=4",
    category: "vehicles",
    hasAR: false,
    description: "Tesla Model 3 Long Range 2019 года в отличном состоянии. Один владелец, всегда в гараже. Включена полная возможность автопилота. Пробег 45 000 км."
  },
  {
    id: "v2",
    title: "Toyota Land Cruiser 200",
    price: 65000.00,
    location: "Ташкент, Шайхантахурский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=40",
    category: "vehicles",
    hasAR: false,
    isHot: true,
    description: "Toyota Land Cruiser 200, 2018 год, пробег 45000 км, дизель, полная комплектация, один хозяин."
  },
  {
    id: "v3",
    title: "Chevrolet Malibu 2",
    price: 22000.00,
    location: "Андижан",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=41",
    category: "vehicles",
    hasAR: false,
    description: "Chevrolet Malibu 2, 2020 год, пробег 25000 км, бензин, комплектация LTZ, без аварий."
  },
  {
    id: "v4",
    title: "Мотоцикл Kawasaki Ninja",
    price: 8500.00,
    location: "Ташкент, Бектемирский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=42",
    category: "vehicles",
    hasAR: false,
    description: "Kawasaki Ninja 650, 2021 год, пробег 5000 км, отличное состояние, все документы."
  },
  
  // Services
  {
    id: "s1",
    title: "Professional Lawn Care Services",
    price: 49.99,
    location: "Ташкент, Чиланзарский",
    image: "https://img.heroui.chat/image/landscape?w=600&h=400&u=5",
    category: "services",
    hasAR: false,
    description: "Профессиональные услуги по уходу за газоном, включая стрижку, обработку краев и уборку. Жилые и коммерческие объекты. Доступны еженедельные, двухнедельные или разовые услуги."
  },
  {
    id: "s2",
    title: "Ремонт квартир под ключ",
    price: 0,
    location: "Ташкент",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=50",
    category: "services",
    hasAR: false,
    description: "Выполняем ремонт квартир под ключ. Опыт работы более 10 лет. Составление сметы, закупка материалов, все виды работ."
  },
  {
    id: "s3",
    title: "Бухгалтерские услуги",
    price: 200.00,
    location: "Ташкент, Мирзо-Улугбекский",
    image: "https://img.heroui.chat/image/crm?w=600&h=400&u=1",
    category: "services",
    hasAR: false,
    isHot: true,
    description: "Бухгалтерское сопровождение ИП и ООО. Подготовка и сдача отчетности, расчет заработной платы, оптимизация налогообложения."
  },
  {
    id: "s4",
    title: "Фотограф на мероприятия",
    price: 100.00,
    location: "Самарканд",
    image: "https://img.heroui.chat/image/ai?w=600&h=400&u=2",
    category: "services",
    hasAR: false,
    description: "Профессиональная фотосъемка свадеб, дней рождения, корпоративов. Опыт работы 7 лет, современное оборудование."
  },
  
  // Real Estate
  {
    id: "r1",
    title: "3-комнатная квартира, 85 м²",
    price: 120000.00,
    location: "Ташкент, Юнусабадский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=60",
    category: "realestate",
    hasAR: true,
    description: "Продается 3-комнатная квартира в новостройке, 85 м², 7/12 этаж. Евроремонт, встроенная кухня, кондиционеры во всех комнатах."
  },
  {
    id: "r2",
    title: "Дом 200 м² на участке 10 соток",
    price: 250000.00,
    location: "Ташкент, Бектемирский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=61",
    category: "realestate",
    hasAR: true,
    isHot: true,
    description: "Двухэтажный дом 200 м² на участке 10 соток. 5 комнат, 2 санузла, гараж на 2 машины, сад с плодовыми деревьями."
  },
  {
    id: "r3",
    title: "Офисное помещение, 120 м²",
    price: 180000.00,
    location: "Ташкент, Мирабадский",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=62",
    category: "realestate",
    hasAR: true,
    description: "Офисное помещение в бизнес-центре класса А, 120 м², 3 кабинета, переговорная, мини-кухня, санузел."
  },
  {
    id: "r4",
    title: "Земельный участок 15 соток",
    price: 45000.00,
    location: "Ташкентская область, Янгиюль",
    image: "https://img.heroui.chat/image/landscape?w=600&h=400&u=10",
    category: "realestate",
    hasAR: false,
    description: "Земельный участок 15 соток под ИЖС. Электричество, газ и вода по границе участка. Ровный рельеф, хорошие подъездные пути."
  },
  
  // Jobs
  {
    id: "j1",
    title: "Frontend Developer (React)",
    price: 1500.00,
    location: "Ташкент, Мирзо-Улугбекский",
    image: "https://img.heroui.chat/image/ai?w=600&h=400&u=70",
    category: "jobs",
    hasAR: false,
    description: "Требуется Frontend Developer со знанием React. Опыт работы от 2 лет. Зарплата от $1500. Офис в центре города, возможна удаленная работа."
  },
  {
    id: "j2",
    title: "Бухгалтер в строительную компанию",
    price: 800.00,
    location: "Ташкент, Чиланзарский",
    image: "https://img.heroui.chat/image/crm?w=600&h=400&u=2",
    category: "jobs",
    hasAR: false,
    description: "Требуется бухгалтер в строительную компанию. Опыт работы от 3 лет, знание 1С, Excel. Полный рабочий день, официальное трудоустройство."
  },
  {
    id: "j3",
    title: "Менеджер по продажам",
    price: 700.00,
    location: "Самарканд",
    image: "https://img.heroui.chat/image/crm?w=600&h=400&u=3",
    category: "jobs",
    hasAR: false,
    isHot: true,
    description: "Требуется менеджер по продажам в компанию по производству мебели. Опыт работы от 1 года. Зарплата: оклад + % от продаж."
  },
  {
    id: "j4",
    title: "Водитель-экспедитор",
    price: 500.00,
    location: "Бухара",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=71",
    category: "jobs",
    hasAR: false,
    description: "Требуется водитель-экспедитор с личным автомобилем. График работы 5/2, оплата ГСМ, амортизация автомобиля."
  },
  
  // Agriculture
  {
    id: "a1",
    title: "Трактор МТЗ-82.1",
    price: 12000.00,
    location: "Джизакская область",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=80",
    category: "agriculture",
    hasAR: false,
    description: "Продается трактор МТЗ-82.1, 2018 год выпуска, наработка 1200 моточасов. В отличном состоянии, все документы в порядке."
  },
  {
    id: "a2",
    title: "Семена хлопчатника элитные",
    price: 5.00,
    location: "Сырдарьинская область",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=81",
    category: "agriculture",
    hasAR: false,
    isHot: true,
    description: "Продаются элитные семена хлопчатника сорта С-6524. Урожайность 40-45 ц/га. Цена за 1 кг. Минимальный заказ 100 кг."
  },
  {
    id: "a3",
    title: "Система капельного орошения",
    price: 2000.00,
    location: "Ферганская область",
    image: "https://img.heroui.chat/image/landscape?w=600&h=400&u=20",
    category: "agriculture",
    hasAR: false,
    description: "Система капельного орошения для участка 1 га. В комплекте: насос, фильтры, магистральные и капельные ленты, фитинги."
  },
  {
    id: "a4",
    title: "Теплица туннельного типа",
    price: 3500.00,
    location: "Ташкентская область",
    image: "https://img.heroui.chat/image/landscape?w=600&h=400&u=21",
    category: "agriculture",
    hasAR: false,
    description: "Теплица туннельного типа 10x30 метров. Металлический каркас, поликарбонат 6 мм, система отопления, автоматический полив."
  }
];

export const auctions = [
  {
    id: "a1",
    title: "Vintage Rolex Submariner 1680",
    currentBid: 8750,
    timeLeft: "2d 4h",
    bids: 18,
    image: "https://img.heroui.chat/image/fashion?w=600&h=400&u=10",
    timePercentage: 65
  },
  {
    id: "a2",
    title: "Rare First Edition Book Collection",
    currentBid: 3200,
    timeLeft: "1d 6h",
    bids: 12,
    image: "https://img.heroui.chat/image/book?w=600&h=400&u=11",
    timePercentage: 40
  },
  {
    id: "a3",
    title: "Signed Michael Jordan Jersey",
    currentBid: 4500,
    timeLeft: "8h 15m",
    bids: 24,
    image: "https://img.heroui.chat/image/sports?w=600&h=400&u=12",
    timePercentage: 15
  },
  {
    id: "a4",
    title: "Antique Victorian Desk",
    currentBid: 1200,
    timeLeft: "3d 12h",
    bids: 7,
    image: "https://img.heroui.chat/image/furniture?w=600&h=400&u=13",
    timePercentage: 85
  }
];

export const services = [
  {
    id: "s1",
    title: "Professional Photography Services",
    provider: "CaptureMoments Studio",
    rating: 4.9,
    price: "$150/hour",
    distance: "2.3 miles",
    image: "https://img.heroui.chat/image/ai?w=600&h=400&u=20",
    category: "creative",
    tags: ["Portrait", "Event", "Commercial"]
  },
  {
    id: "s2",
    title: "Home Cleaning Service",
    provider: "CleanSwipe Pro",
    rating: 4.8,
    price: "$25/hour",
    distance: "1.5 miles",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=21",
    category: "home",
    tags: ["Deep Clean", "Regular", "Move-in/out"]
  },
  {
    id: "s3",
    title: "Mobile Car Mechanic",
    provider: "RoadReady Services",
    rating: 4.7,
    price: "$80/hour + parts",
    distance: "3.8 miles",
    image: "https://img.heroui.chat/image/places?w=600&h=400&u=22",
    category: "automotive",
    tags: ["Diagnostics", "Repair", "Maintenance"]
  },
  {
    id: "s4",
    title: "Personal Fitness Trainer",
    provider: "FitLife Coaching",
    rating: 5.0,
    price: "$60/session",
    distance: "0.9 miles",
    image: "https://img.heroui.chat/image/sports?w=600&h=400&u=23",
    category: "fitness",
    tags: ["Strength", "Weight Loss", "Nutrition"]
  }
];