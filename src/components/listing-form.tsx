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

interface ListingFormProps {
  listingType: "vehicle" | "realestate";
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ListingForm: React.FC<ListingFormProps> = ({ 
  listingType, 
  onSubmit, 
  onCancel 
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  
  // Vehicle specific fields
  const [vehicleCondition, setVehicleCondition] = React.useState("");
  const [mileage, setMileage] = React.useState("");
  const [year, setYear] = React.useState("");
  const [repairHistory, setRepairHistory] = React.useState("");
  const [accidentStatus, setAccidentStatus] = React.useState("");
  const [engineSize, setEngineSize] = React.useState("");
  const [numOwners, setNumOwners] = React.useState("1");
  const [vehicleBrand, setVehicleBrand] = React.useState("");
  const [vehicleModel, setVehicleModel] = React.useState("");
  const [fuelType, setFuelType] = React.useState("");
  const [transmission, setTransmission] = React.useState("");
  
  // Real estate specific fields
  const [area, setArea] = React.useState("");
  const [numRooms, setNumRooms] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [totalFloors, setTotalFloors] = React.useState("");
  const [buildingAge, setBuildingAge] = React.useState("");
  const [renovationStatus, setRenovationStatus] = React.useState("");
  const [utilities, setUtilities] = React.useState<string[]>([]);
  const [propertyType, setPropertyType] = React.useState("");
  const [dealType, setDealType] = React.useState("sale");
  const [balcony, setBalcony] = React.useState(false);
  const [parking, setParking] = React.useState(false);
  
  const handleImageUpload = () => {
    // In a real app, this would handle file uploads
    // For demo purposes, we'll add placeholder images
    const categoryImages: Record<string, string> = {
      "vehicle": "places",
      "realestate": "places"
    };
    
    const imageCategory = categoryImages[listingType] || "places";
    const newImage = `https://img.heroui.chat/image/${imageCategory}?w=600&h=400&u=${Math.random().toString(36).substring(7)}`;
    
    setImages([...images, newImage]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commonData = {
      title,
      description,
      price,
      images
    };
    
    let specificData = {};
    
    if (listingType === "vehicle") {
      specificData = {
        condition: vehicleCondition,
        mileage,
        year,
        repairHistory,
        accidentStatus,
        engineSize,
        numOwners,
        brand: vehicleBrand,
        model: vehicleModel,
        fuelType,
        transmission
      };
    } else {
      specificData = {
        area,
        numRooms,
        floor,
        totalFloors,
        buildingAge,
        renovationStatus,
        utilities,
        propertyType,
        dealType,
        balcony,
        parking
      };
    }
    
    onSubmit({
      ...commonData,
      ...specificData,
      listingType
    });
  };
  
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear; i >= currentYear - 50; i--) {
      years.push(i.toString());
    }
    
    return years;
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <h2 className="text-xl font-bold">
          {listingType === "vehicle" ? "Добавить транспортное средство" : "Добавить недвижимость"}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <Input
              label="Название объявления"
              placeholder="Введите название"
              value={title}
              onValueChange={setTitle}
              isRequired
            />
            
            <Input
              label="Цена"
              placeholder="0.00"
              value={price}
              onValueChange={setPrice}
              startContent={<span className="text-default-400">₽</span>}
              type="number"
              isRequired
            />
            
            <Textarea
              label="Описание"
              placeholder="Подробно опишите ваш товар"
              value={description}
              onValueChange={setDescription}
              minRows={3}
            />
            
            <div>
              <p className="text-sm font-medium mb-2">Фотографии</p>
              <div className="text-center p-4 border-2 border-dashed rounded-lg border-default-300 cursor-pointer hover:border-primary transition-colors"
                onClick={handleImageUpload}
              >
                <Icon icon="lucide:upload-cloud" className="text-2xl text-default-400 mx-auto mb-2" />
                <p className="text-default-500 text-sm">Нажмите для загрузки фотографий</p>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Изображение ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="my-4">
            <Divider />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Характеристики</h3>
            
            {listingType === "vehicle" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Марка"
                    placeholder="Выберите марку"
                    selectedKeys={vehicleBrand ? [vehicleBrand] : []}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    isRequired
                  >
                    <SelectItem key="toyota" value="Toyota">Toyota</SelectItem>
                    <SelectItem key="volkswagen" value="Volkswagen">Volkswagen</SelectItem>
                    <SelectItem key="bmw" value="BMW">BMW</SelectItem>
                    <SelectItem key="mercedes" value="Mercedes">Mercedes</SelectItem>
                    <SelectItem key="audi" value="Audi">Audi</SelectItem>
                    <SelectItem key="honda" value="Honda">Honda</SelectItem>
                    <SelectItem key="ford" value="Ford">Ford</SelectItem>
                    <SelectItem key="chevrolet" value="Chevrolet">Chevrolet</SelectItem>
                    <SelectItem key="hyundai" value="Hyundai">Hyundai</SelectItem>
                    <SelectItem key="kia" value="Kia">Kia</SelectItem>
                    <SelectItem key="other" value="Другое">Другое</SelectItem>
                  </Select>
                  
                  <Input
                    label="Модель"
                    placeholder="Введите модель"
                    value={vehicleModel}
                    onValueChange={setVehicleModel}
                    isRequired
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Состояние"
                    placeholder="Выберите состояние"
                    selectedKeys={vehicleCondition ? [vehicleCondition] : []}
                    onChange={(e) => setVehicleCondition(e.target.value)}
                    isRequired
                  >
                    <SelectItem key="new" value="new">Новый</SelectItem>
                    <SelectItem key="used" value="used">Подержанный</SelectItem>
                  </Select>
                  
                  <Select
                    label="Год выпуска"
                    placeholder="Выберите год"
                    selectedKeys={year ? [year] : []}
                    onChange={(e) => setYear(e.target.value)}
                    isRequired
                  >
                    {getYears().map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Пробег (км)"
                    placeholder="Введите пробег"
                    value={mileage}
                    onValueChange={setMileage}
                    type="number"
                    isRequired
                  />
                  
                  <Input
                    label="Объем двигателя (л)"
                    placeholder="Например: 2.0"
                    value={engineSize}
                    onValueChange={setEngineSize}
                    isRequired
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Тип топлива"
                    placeholder="Выберите тип топлива"
                    selectedKeys={fuelType ? [fuelType] : []}
                    onChange={(e) => setFuelType(e.target.value)}
                  >
                    <SelectItem key="petrol" value="petrol">Бензин</SelectItem>
                    <SelectItem key="diesel" value="diesel">Дизель</SelectItem>
                    <SelectItem key="gas" value="gas">Газ</SelectItem>
                    <SelectItem key="hybrid" value="hybrid">Гибрид</SelectItem>
                    <SelectItem key="electric" value="electric">Электро</SelectItem>
                  </Select>
                  
                  <Select
                    label="Коробка передач"
                    placeholder="Выберите тип коробки"
                    selectedKeys={transmission ? [transmission] : []}
                    onChange={(e) => setTransmission(e.target.value)}
                  >
                    <SelectItem key="manual" value="manual">Механическая</SelectItem>
                    <SelectItem key="automatic" value="automatic">Автоматическая</SelectItem>
                    <SelectItem key="robot" value="robot">Робот</SelectItem>
                    <SelectItem key="variator" value="variator">Вариатор</SelectItem>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Количество владельцев"
                    placeholder="Выберите количество"
                    selectedKeys={[numOwners]}
                    onChange={(e) => setNumOwners(e.target.value)}
                  >
                    <SelectItem key="1" value="1">1 владелец</SelectItem>
                    <SelectItem key="2" value="2">2 владельца</SelectItem>
                    <SelectItem key="3" value="3">3 владельца</SelectItem>
                    <SelectItem key="4+" value="4+">4 и более владельцев</SelectItem>
                  </Select>
                  
                  <Select
                    label="Статус ДТП"
                    placeholder="Выберите статус"
                    selectedKeys={accidentStatus ? [accidentStatus] : []}
                    onChange={(e) => setAccidentStatus(e.target.value)}
                  >
                    <SelectItem key="none" value="none">Не участвовал в ДТП</SelectItem>
                    <SelectItem key="minor" value="minor">Были мелкие ДТП</SelectItem>
                    <SelectItem key="major" value="major">Были серьезные ДТП</SelectItem>
                  </Select>
                </div>
                
                <Select
                  label="История ремонта"
                  placeholder="Выберите историю ремонта"
                  selectedKeys={repairHistory ? [repairHistory] : []}
                  onChange={(e) => setRepairHistory(e.target.value)}
                >
                  <SelectItem key="none" value="none">Не требует ремонта</SelectItem>
                  <SelectItem key="minor" value="minor">Требуется мелкий ремонт</SelectItem>
                  <SelectItem key="major" value="major">Требуется серьезный ремонт</SelectItem>
                  <SelectItem key="restored" value="restored">Восстановлен после ДТП</SelectItem>
                </Select>
              </>
            )}
            
            {listingType === "realestate" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Тип недвижимости"
                    placeholder="Выберите тип"
                    selectedKeys={propertyType ? [propertyType] : []}
                    onChange={(e) => setPropertyType(e.target.value)}
                    isRequired
                  >
                    <SelectItem key="apartment" value="apartment">Квартира</SelectItem>
                    <SelectItem key="house" value="house">Дом</SelectItem>
                    <SelectItem key="townhouse" value="townhouse">Таунхаус</SelectItem>
                    <SelectItem key="land" value="land">Земельный участок</SelectItem>
                    <SelectItem key="commercial" value="commercial">Коммерческая недвижимость</SelectItem>
                  </Select>
                  
                  <Select
                    label="Тип сделки"
                    placeholder="Выберите тип сделки"
                    selectedKeys={[dealType]}
                    onChange={(e) => setDealType(e.target.value)}
                    isRequired
                  >
                    <SelectItem key="sale" value="sale">Продажа</SelectItem>
                    <SelectItem key="rent" value="rent">Аренда</SelectItem>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Площадь (м²)"
                    placeholder="Введите площадь"
                    value={area}
                    onValueChange={setArea}
                    type="number"
                    isRequired
                  />
                  
                  <Select
                    label="Количество комнат"
                    placeholder="Выберите количество"
                    selectedKeys={numRooms ? [numRooms] : []}
                    onChange={(e) => setNumRooms(e.target.value)}
                    isRequired
                  >
                    <SelectItem key="studio" value="studio">Студия</SelectItem>
                    <SelectItem key="1" value="1">1 комната</SelectItem>
                    <SelectItem key="2" value="2">2 комнаты</SelectItem>
                    <SelectItem key="3" value="3">3 комнаты</SelectItem>
                    <SelectItem key="4" value="4">4 комнаты</SelectItem>
                    <SelectItem key="5+" value="5+">5 и более комнат</SelectItem>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Этаж"
                      placeholder="Этаж"
                      value={floor}
                      onValueChange={setFloor}
                      type="number"
                    />
                    
                    <Input
                      label="Всего этажей"
                      placeholder="Всего"
                      value={totalFloors}
                      onValueChange={setTotalFloors}
                      type="number"
                    />
                  </div>
                  
                  <Input
                    label="Возраст здания (лет)"
                    placeholder="Введите возраст"
                    value={buildingAge}
                    onValueChange={setBuildingAge}
                    type="number"
                  />
                </div>
                
                <Select
                  label="Статус ремонта"
                  placeholder="Выберите статус"
                  selectedKeys={renovationStatus ? [renovationStatus] : []}
                  onChange={(e) => setRenovationStatus(e.target.value)}
                >
                  <SelectItem key="none" value="none">Без ремонта</SelectItem>
                  <SelectItem key="cosmetic" value="cosmetic">Косметический ремонт</SelectItem>
                  <SelectItem key="euro" value="euro">Евроремонт</SelectItem>
                  <SelectItem key="designer" value="designer">Дизайнерский ремонт</SelectItem>
                </Select>
                
                <div>
                  <p className="text-sm font-medium mb-2">Коммуникации</p>
                  <CheckboxGroup
                    value={utilities}
                    onValueChange={setUtilities}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Checkbox value="electricity">Электричество</Checkbox>
                      <Checkbox value="water">Водоснабжение</Checkbox>
                      <Checkbox value="gas">Газ</Checkbox>
                      <Checkbox value="sewage">Канализация</Checkbox>
                      <Checkbox value="heating">Центральное отопление</Checkbox>
                      <Checkbox value="internet">Интернет</Checkbox>
                    </div>
                  </CheckboxGroup>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Балкон/лоджия</p>
                    <Switch
                      isSelected={balcony}
                      onValueChange={setBalcony}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Парковка</p>
                    <Switch
                      isSelected={parking}
                      onValueChange={setParking}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex justify-between">
        <Button
          variant="flat"
          color="default"
          onPress={onCancel}
        >
          Отмена
        </Button>
        
        <Button
          color="primary"
          onPress={handleSubmit}
        >
          Опубликовать
        </Button>
      </CardFooter>
    </Card>
  );
};