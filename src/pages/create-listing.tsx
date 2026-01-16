import React from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  Input, 
  Textarea, 
  Select, 
  SelectItem,
  Switch,
  Divider,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { CategorySelector } from "../components/category-selector";
import useProductStore from "../store/product";

export const CreateListingPage: React.FC = () => {
  const { t } = useLanguage();
  const { postProduct } = useProductStore();
  
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [subcategory, setSubcategory] = React.useState("");
  const [condition, setCondition] = React.useState("");
  const [images, setImages] = React.useState<File[]>([]);
  const [activeTab, setActiveTab] = React.useState("details");
  const [sellerType, setSellerType] = React.useState("individual");
  const [deliveryOptions, setDeliveryOptions] = React.useState<string[]>([]);
  const [contactMethod, setContactMethod] = React.useState("phone");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telegram, setTelegram] = React.useState("");
  const [location, setLocation] = React.useState({
    region: "Ташкент",
    city: "Ташкент",
    district: "Все районы"
  });
  const [isHot, setIsHot] = React.useState(false);
  const [hasAR, setHasAR] = React.useState(false);
  const [isNew, setIsNew] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  // Dynamic parameters based on category
  const [dynamicParams, setDynamicParams] = React.useState<Record<string, any>>({});

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSubcategory("");
    
    // Reset dynamic parameters when category changes
    setDynamicParams({});
  };

  // Handle subcategory change
  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory);
  };

  // Update dynamic parameters
  const updateDynamicParam = (key: string, value: any) => {
    setDynamicParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleImageUpload = (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]);
    } else {
      // Для демонстрации - создаем фиктивный файл
      const demoFile = new File(['demo'], 'demo.jpg', { type: 'image/jpeg' });
      setImages([...images, demoFile]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Функция для определения delivery на основе deliveryOptions
  const getDeliveryType = () => {
    if (deliveryOptions.includes("delivery") && deliveryOptions.includes("pickup")) {
      return "both";
    } else if (deliveryOptions.includes("delivery")) {
      return "delivery";
    } else if (deliveryOptions.includes("pickup")) {
      return "pickup";
    }
    return "pickup"; // по умолчанию
  };

  // Функция для отправки объявления
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Подготавливаем данные для отправки
      const formData = new FormData();
      
      // Основные поля
      formData.append('product_category', category);
      formData.append('product_name', title);
      formData.append('product_price', price);
      formData.append('product_tags', JSON.stringify([])); // пустой массив тегов
      formData.append('product_desc', description);
      formData.append('product_safety', JSON.stringify([])); // пустой массив безопасности
      formData.append('region', location.region);
      formData.append('city', location.city);
      formData.append('district', location.district);
      
      // Загрузка изображения (берем первое)
      if (images.length > 0) {
        formData.append('product_img', images[0]);
      }
      
      // Boolean поля
      formData.append('isHot', isHot.toString());
      formData.append('hasAR', hasAR.toString());
      formData.append('isNew', isNew.toString());
      
      // Enum поля
      formData.append('seller_type', sellerType);
      formData.append('delivery', getDeliveryType());

      // Отправляем данные
      const response = await postProduct(formData);
      
      if (response) {
        // Успешно создано - можно перенаправить или показать уведомление
        alert('Объявление успешно опубликовано!');
      } else {
        throw new Error('Ошибка при создании объявления');
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert('Произошла ошибка при публикации объявления');
    } finally {
      setIsLoading(false);
    }
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    const subcategories: Record<string, string[]> = {
      "electronics": ["Смартфоны", "Компьютеры", "Телевизоры", "Аудиотехника", "Фототехника", "Бытовая техника"],
      "furniture": ["Диваны", "Столы", "Стулья", "Шкафы", "Кровати", "Кухонная мебель"],
      "clothing": ["Мужская одежда", "Женская одежда", "Детская одежда", "Обувь", "Аксессуары"],
      "vehicles": ["Легковые автомобили", "Грузовые автомобили", "Мотоциклы", "Запчасти", "Аксессуары"],
      "realestate": ["Квартиры", "Дома", "Земельные участки", "Коммерческая недвижимость", "Аренда"],
      "services": ["Ремонт", "Красота", "Образование", "Перевозки", "IT услуги", "Бытовые услуги"],
      "jobs": ["IT", "Продажи", "Производство", "Образование", "Медицина", "Строительство"],
      "agriculture": ["Сельхозтехника", "Животные", "Растения", "Удобрения", "Инструменты"]
    };
    
    return category !== "all" && subcategories[category] 
      ? subcategories[category] 
      : [];
  };

  // Get dynamic parameters based on category and subcategory
  const getDynamicParameters = () => {
    if (category === "electronics" && subcategory === "Смартфоны") {
      return (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">Бренд</h4>
            <Select 
              placeholder="Выберите бренд"
              selectedKeys={dynamicParams.brand ? [dynamicParams.brand] : []}
              onChange={(e) => updateDynamicParam('brand', e.target.value)}
            >
              <SelectItem key="apple">Apple</SelectItem>
              <SelectItem key="samsung">Samsung</SelectItem>
              <SelectItem key="xiaomi">Xiaomi</SelectItem>
              <SelectItem key="huawei">Huawei</SelectItem>
              <SelectItem key="other">Другое</SelectItem>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Память (ГБ)</h4>
            <Select 
              placeholder="Объем памяти"
              selectedKeys={dynamicParams.memory ? [dynamicParams.memory] : []}
              onChange={(e) => updateDynamicParam('memory', e.target.value)}
            >
              <SelectItem key="16">16 ГБ</SelectItem>
              <SelectItem key="32">32 ГБ</SelectItem>
              <SelectItem key="64">64 ГБ</SelectItem>
              <SelectItem key="128">128 ГБ</SelectItem>
              <SelectItem key="256">256 ГБ</SelectItem>
              <SelectItem key="512">512 ГБ</SelectItem>
              <SelectItem key="1024">1 ТБ</SelectItem>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Оперативная память (ГБ)</h4>
            <Select 
              placeholder="Оперативная память"
              selectedKeys={dynamicParams.ram ? [dynamicParams.ram] : []}
              onChange={(e) => updateDynamicParam('ram', e.target.value)}
            >
              <SelectItem key="2">2 ГБ</SelectItem>
              <SelectItem key="3">3 ГБ</SelectItem>
              <SelectItem key="4">4 ГБ</SelectItem>
              <SelectItem key="6">6 ГБ</SelectItem>
              <SelectItem key="8">8 ГБ</SelectItem>
              <SelectItem key="12">12 ГБ</SelectItem>
              <SelectItem key="16">16 ГБ</SelectItem>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Цвет</h4>
            <Select 
              placeholder="Выберите цвет"
              selectedKeys={dynamicParams.color ? [dynamicParams.color] : []}
              onChange={(e) => updateDynamicParam('color', e.target.value)}
            >
              <SelectItem key="black">Черный</SelectItem>
              <SelectItem key="white">Белый</SelectItem>
              <SelectItem key="gray">Серый</SelectItem>
              <SelectItem key="blue">Синий</SelectItem>
              <SelectItem key="red">Красный</SelectItem>
              <SelectItem key="gold">Золотой</SelectItem>
              <SelectItem key="other">Другой</SelectItem>
            </Select>
          </div>
        </>
      );
    } else if (category === "vehicles" && subcategory === "Легковые автомобили") {
      return (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">Марка</h4>
            <Select 
              placeholder="Выберите марку"
              selectedKeys={dynamicParams.brand ? [dynamicParams.brand] : []}
              onChange={(e) => updateDynamicParam('brand', e.target.value)}
            >
              <SelectItem key="toyota">Toyota</SelectItem>
              <SelectItem key="chevrolet">Chevrolet</SelectItem>
              <SelectItem key="mercedes">Mercedes</SelectItem>
              <SelectItem key="bmw">BMW</SelectItem>
              <SelectItem key="audi">Audi</SelectItem>
              <SelectItem key="other">Другое</SelectItem>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Год выпуска</h4>
            <Select 
              placeholder="Выберите год"
              selectedKeys={dynamicParams.year ? [dynamicParams.year] : []}
              onChange={(e) => updateDynamicParam('year', e.target.value)}
            >
              {Array.from({length: 30}, (_, i) => (
                <SelectItem key={`${2023-i}`}>{2023-i}</SelectItem>
              ))}
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Тип двигателя</h4>
            <RadioGroup 
              value={dynamicParams.engineType || ""}
              onValueChange={(value) => updateDynamicParam('engineType', value)}
            >
              <Radio value="petrol">Бензин</Radio>
              <Radio value="diesel">Дизель</Radio>
              <Radio value="gas">Газ</Radio>
              <Radio value="hybrid">Гибрид</Radio>
              <Radio value="electric">Электро</Radio>
            </RadioGroup>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Пробег (км)</h4>
            <Input 
              type="number" 
              placeholder="Введите пробег"
              value={dynamicParams.mileage || ""}
              onValueChange={(value) => updateDynamicParam('mileage', value)}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Коробка передач</h4>
            <RadioGroup 
              value={dynamicParams.transmission || ""}
              onValueChange={(value) => updateDynamicParam('transmission', value)}
            >
              <Radio value="manual">Механическая</Radio>
              <Radio value="automatic">Автоматическая</Radio>
              <Radio value="robot">Робот</Radio>
              <Radio value="variator">Вариатор</Radio>
            </RadioGroup>
          </div>
        </>
      );
    } else if (category === "realestate" && subcategory === "Квартиры") {
      return (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">Количество комнат</h4>
            <RadioGroup 
              value={dynamicParams.rooms || ""}
              onValueChange={(value) => updateDynamicParam('rooms', value)}
            >
              <Radio value="1">1</Radio>
              <Radio value="2">2</Radio>
              <Radio value="3">3</Radio>
              <Radio value="4">4</Radio>
              <Radio value="5+">5+</Radio>
            </RadioGroup>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Площадь (м²)</h4>
            <Input 
              type="number" 
              placeholder="Общая площадь"
              value={dynamicParams.area || ""}
              onValueChange={(value) => updateDynamicParam('area', value)}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Этаж</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="number" 
                placeholder="Этаж"
                value={dynamicParams.floor || ""}
                onValueChange={(value) => updateDynamicParam('floor', value)}
              />
              <Input 
                type="number" 
                placeholder="Всего этажей"
                value={dynamicParams.totalFloors || ""}
                onValueChange={(value) => updateDynamicParam('totalFloors', value)}
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Тип сделки</h4>
            <RadioGroup 
              value={dynamicParams.dealType || ""}
              onValueChange={(value) => updateDynamicParam('dealType', value)}
            >
              <Radio value="sale">Продажа</Radio>
              <Radio value="rent">Аренда</Radio>
            </RadioGroup>
          </div>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Создать объявление</h1>
        <p className="text-default-600 text-lg">
          Заполните информацию о вашем товаре или услуге
        </p>
      </motion.div>

      <Card className="glass-card border-none mb-8">
        <CardHeader>
          <Tabs 
            aria-label="Listing creation tabs" 
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full bg-primary-200",
              tab: "max-w-fit px-2 h-12",
            }}
          >
            <Tab
              key="details"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:clipboard" />
                  <span>Основная информация</span>
                </div>
              }
            />
            <Tab
              key="images"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:image" />
                  <span>Фотографии</span>
                  <Chip size="sm" variant="flat" color="primary">{images.length}</Chip>
                </div>
              }
            />
            <Tab
              key="contact"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" />
                  <span>Контакты</span>
                </div>
              }
            />
            <Tab
              key="preview"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:eye" />
                  <span>Предпросмотр</span>
                </div>
              }
              isDisabled={!title || !price || category === "all"}
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          {activeTab === "details" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Input
                label="Название объявления"
                placeholder="Введите название товара или услуги"
                value={title}
                onValueChange={setTitle}
                variant="bordered"
                isRequired
              />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Категория</h3>
                <CategorySelector onCategoryChange={handleCategoryChange} />
              </div>
              
              {getSubcategories().length > 0 && (
                <Select
                  label="Подкатегория"
                  placeholder="Выберите подкатегорию"
                  selectedKeys={subcategory ? [subcategory] : []}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  variant="bordered"
                  isRequired
                >
                  {getSubcategories().map((subcat) => (
                    <SelectItem key={subcat} data-value={subcat}>
                      {subcat}
                    </SelectItem>
                  ))}
                </Select>
              )}
              
              <Input
                label="Цена"
                placeholder="0.00"
                value={price}
                onValueChange={setPrice}
                variant="bordered"
                startContent={<span className="text-default-400">₽</span>}
                type="number"
                isRequired
              />
              
              <Select
                label="Состояние"
                placeholder="Выберите состояние"
                selectedKeys={condition ? [condition] : []}
                onChange={(e) => setCondition(e.target.value)}
                variant="bordered"
              >
                <SelectItem key="new">Новое</SelectItem>
                <SelectItem key="likenew">Как новое</SelectItem>
                <SelectItem key="good">Хорошее</SelectItem>
                <SelectItem key="fair">Удовлетворительное</SelectItem>
                <SelectItem key="poor">Требует ремонта</SelectItem>
              </Select>

              {/* Дополнительные опции */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Новый товар</span>
                  <Switch isSelected={isNew} onValueChange={setIsNew} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Горячее предложение</span>
                  <Switch isSelected={isHot} onValueChange={setIsHot} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Поддержка AR</span>
                  <Switch isSelected={hasAR} onValueChange={setHasAR} />
                </div>
              </div>
              
              <Textarea
                label="Описание"
                placeholder="Подробно опишите ваш товар или услугу"
                value={description}
                onValueChange={setDescription}
                variant="bordered"
                minRows={4}
              />
              
              {/* Dynamic parameters based on category and subcategory */}
              {category !== "all" && subcategory && (
                <>
                  <div className="flex items-center gap-2 my-4">
                    <Divider className="flex-grow" />
                    <span className="text-default-500 text-sm px-2">Характеристики</span>
                    <Divider className="flex-grow" />
                  </div>
                  
                  <div className="space-y-4">
                    {getDynamicParameters()}
                  </div>
                </>
              )}
              
              <Divider className="my-4" />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="flat"
                  color="default"
                  startContent={<Icon icon="lucide:save" />}
                >
                  Сохранить как черновик
                </Button>
                <Button
                  color="primary"
                  onPress={() => setActiveTab("images")}
                  endContent={<Icon icon="lucide:arrow-right" />}
                >
                  Далее
                </Button>
              </div>
            </motion.div>
          )}
          
          {activeTab === "images" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center p-8 border-2 border-dashed rounded-lg border-default-300 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Icon icon="lucide:upload-cloud" className="text-4xl text-default-400 mx-auto mb-2" />
                  <h3 className="font-medium">Загрузить фотографии</h3>
                  <p className="text-default-500 text-sm">Перетащите файлы или нажмите для выбора</p>
                  <p className="text-default-500 text-xs mt-2">Рекомендуемый размер: не менее 800x600 пикселей</p>
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={file instanceof File ? URL.createObjectURL(file) : file} 
                        alt={`Изображение ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          isIconOnly 
                          color="danger" 
                          variant="flat" 
                          size="sm"
                          onPress={() => removeImage(index)}
                        >
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          Главное фото
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-default-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon icon="lucide:info" className="text-primary mt-1" />
                  <div>
                    <h4 className="text-sm font-medium">Рекомендации по фотографиям</h4>
                    <ul className="text-xs text-default-600 list-disc pl-4 mt-1 space-y-1">
                      <li>Добавьте не менее 3 фотографий</li>
                      <li>Первое фото будет главным в объявлении</li>
                      <li>Фотографии должны быть четкими и хорошо освещенными</li>
                      <li>Показывайте товар с разных ракурсов</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              <div className="flex justify-between gap-2">
                <Button
                  variant="flat"
                  color="default"
                  startContent={<Icon icon="lucide:arrow-left" />}
                  onPress={() => setActiveTab("details")}
                >
                  Назад
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:save" />}
                  >
                    Сохранить как черновик
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => setActiveTab("preview")}
                    endContent={<Icon icon="lucide:arrow-right" />}
                    isDisabled={!title || !price || category === "all"}
                  >
                    Предпросмотр
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === "preview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-content2 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div>
                    {images.length > 0 ? (
                      <img 
                        src={images[0] instanceof File ? URL.createObjectURL(images[0]) : images[0]} 
                        alt={title} 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-default-100 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:image" className="text-4xl text-default-400" />
                      </div>
                    )}
                    
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {images.slice(0, 4).map((file, index) => (
                          <img 
                            key={index} 
                            src={file instanceof File ? URL.createObjectURL(file) : file} 
                            alt={`Thumbnail ${index + 1}`} 
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{parseFloat(price).toLocaleString()} ₽</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Chip color="primary" variant="flat">{category !== "all" ? category : ""}</Chip>
                      {subcategory && (
                        <Chip color="secondary" variant="flat">{subcategory}</Chip>
                      )}
                      {condition && (
                        <Chip color="default" variant="flat">{
                          condition === "new" ? "Новое" :
                          condition === "likenew" ? "Как новое" :
                          condition === "good" ? "Хорошее" :
                          condition === "fair" ? "Удовлетворительное" :
                          "Требует ремонта"
                        }</Chip>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Описание</h3>
                      <p className="text-default-600">{description || "Описание отсутствует."}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-default-500 text-sm mb-4">
                      <Icon icon="lucide:map-pin" width={16} height={16} />
                      <span>{location.region}, {location.city}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Button 
                        color="primary"
                        size="lg"
                        className="flex-1"
                        startContent={<Icon icon="lucide:check" />}
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        isDisabled={!title || !price || category === "all"}
                      >
                        {isLoading ? "Публикуется..." : "Опубликовать объявление"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              <div className="flex justify-between gap-2">
                <Button
                  variant="flat"
                  color="default"
                  startContent={<Icon icon="lucide:arrow-left" />}
                  onPress={() => setActiveTab("contact")}
                >
                  Назад
                </Button>
                
                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:check" />}
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!title || !price || category === "all"}
                >
                  {isLoading ? "Публикуется..." : "Опубликовать объявление"}
                </Button>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
