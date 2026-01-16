import React from "react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button,
  Input
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface CitySelectorProps {
  onCityChange: (city: string) => void;
  selectedCity: string;
  region: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ 
  onCityChange, 
  selectedCity,
  region
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Cities by region
  const citiesByRegion: Record<string, string[]> = {
    "Ташкент": ["Все районы", "Алмазарский", "Бектемирский", "Мирабадский", "Мирзо-Улугбекский", "Сергелийский", "Чиланзарский", "Шайхантахурский", "Юнусабадский", "Яккасарайский", "Яшнабадский"],
    "Андижанская область": ["Все города", "Андижан", "Асака", "Ханабад", "Шахрихан", "Пайтуг", "Карасу"],
    "Бухарская область": ["Все города", "Бухара", "Каган", "Газли", "Гиждуван", "Шафиркан", "Вабкент"],
    "Джизакская область": ["Все города", "Джизак", "Галляарал", "Пахтакор", "Дустлик"],
    "Кашкадарьинская область": ["Все города", "Карши", "Шахрисабз", "Китаб", "Гузар", "Мубарек"],
    "Навоийская область": ["Все города", "Навои", "Зарафшан", "Учкудук", "Нурата"],
    "Наманганская область": ["Все города", "Наманган", "Чуст", "Касансай", "Чартак", "Туракурган"],
    "Самаркандская область": ["Все города", "Самарканд", "Каттакурган", "Ургут", "Булунгур", "Иштыхан"],
    "Сурхандарьинская область": ["Все города", "Термез", "Денау", "Шерабад", "Байсун", "Кумкурган"],
    "Сырдарьинская область": ["Все города", "Гулистан", "Сырдарья", "Янгиер", "Ширин"],
    "Ташкентская область": ["Все города", "Ангрен", "Алмалык", "Бекабад", "Чирчик", "Янгиюль", "Газалкент", "Паркент"],
    "Ферганская область": ["Все города", "Фергана", "Коканд", "Кувасай", "Маргилан", "Кува", "Риштан"],
    "Хорезмская область": ["Все города", "Ургенч", "Хива", "Питнак", "Дружба", "Ханка"],
    "Республика Каракалпакстан": ["Все города", "Нукус", "Беруни", "Турткуль", "Чимбай", "Тахиаташ"]
  };

  const defaultCities = ["Выберите город"];
  
  // Get cities for the selected region or use default
  const cities = region !== "Все регионы" && citiesByRegion[region] 
    ? citiesByRegion[region] 
    : defaultCities;
  
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If region changes, reset selected city
  React.useEffect(() => {
    if (region !== "Все регионы" && citiesByRegion[region]) {
      onCityChange(citiesByRegion[region][0]);
    } else {
      onCityChange("Выберите город");
    }
  }, [region]);

  const isDisabled = region === "Все регионы";

  return (
    <div className="mb-6">
      <Dropdown isDisabled={isDisabled}>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            color={isDisabled ? "default" : "primary"}
            className="w-full justify-start"
            startContent={<Icon icon="lucide:building" />}
            endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
          >
            {selectedCity}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Cities of Uzbekistan"
          className="w-[340px]"
          onAction={(key) => onCityChange(key as string)}
          selectedKeys={[selectedCity]}
          selectionMode="single"
        >
          <DropdownItem key="search-item" textValue="Search" isReadOnly className="p-0">
            <Input
              placeholder="Поиск города..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              size="sm"
              className="mb-2 px-2 py-2"
            />
          </DropdownItem>
          
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <DropdownItem key={city} textValue={city}>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={city.startsWith("Все") ? "lucide:list" : "lucide:building"} 
                    className="text-default-500"
                    size={16}
                  />
                  <span>{city}</span>
                </div>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem isDisabled textValue="No results">
              Города не найдены
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};