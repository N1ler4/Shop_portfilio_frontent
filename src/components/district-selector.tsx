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

interface DistrictSelectorProps {
  onDistrictChange: (district: string) => void;
  selectedDistrict: string;
  city: string;
  region: string;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = ({ 
  onDistrictChange, 
  selectedDistrict,
  city,
  region
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Districts by city (sample data - would be expanded in a real application)
  const districtsByCity: Record<string, Record<string, string[]>> = {
    "Ташкент": {
      "Алмазарский": ["Все районы", "Кора-Камыш", "Янгиабад", "Олмазор"],
      "Бектемирский": ["Все районы", "Бектемир", "Сувсоз"],
      "Мирабадский": ["Все районы", "Миробод", "Госпитальный", "Ц-1"],
      "Мирзо-Улугбекский": ["Все районы", "Карасу", "Дархан", "Улугбек"],
      "Сергелийский": ["Все районы", "Сергели", "Спутник"],
      "Чиланзарский": ["Все районы", "Чиланзар-1", "Чиланзар-2", "Чиланзар-3"],
      "Шайхантахурский": ["Все районы", "Шайхантахур", "Заркайнар", "Сагбан"],
      "Юнусабадский": ["Все районы", "Юнусабад-1", "Юнусабад-2", "Юнусабад-3"],
      "Яккасарайский": ["Все районы", "Яккасарай", "Кушбеги", "Абдулла Кодирий"],
      "Яшнабадский": ["Все районы", "Яшнабад", "Ташсельмаш", "ТТЗ"]
    },
    "Самарканд": {
      "Все города": ["Все районы"],
      "Самарканд": ["Все районы", "Центр", "Согдиана", "Университетский", "Железнодорожный"]
    },
    "Бухара": {
      "Все города": ["Все районы"],
      "Бухара": ["Все районы", "Старый город", "Новый город", "Промышленный"]
    }
  };

  const defaultDistricts = ["Выберите район"];
  
  // Get districts for the selected city or use default
  const districts = region !== "Все регионы" && 
                   city !== "Все города" && 
                   districtsByCity[region]?.[city] 
    ? districtsByCity[region][city] 
    : defaultDistricts;
  
  const filteredDistricts = districts.filter(district => 
    district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If city changes, reset selected district
  React.useEffect(() => {
    if (region !== "Все регионы" && 
        city !== "Все города" && 
        districtsByCity[region]?.[city]) {
      onDistrictChange(districtsByCity[region][city][0]);
    } else {
      onDistrictChange("Выберите район");
    }
  }, [city, region]);

  const isDisabled = region === "Все регионы" || 
                    city === "Все города" || 
                    city === "Выберите город" ||
                    !districtsByCity[region]?.[city];

  return (
    <div className="mb-6">
      <Dropdown isDisabled={isDisabled}>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            color={isDisabled ? "default" : "primary"}
            className="w-full justify-start"
            startContent={<Icon icon="lucide:map" />}
            endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
          >
            {selectedDistrict}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Districts"
          className="w-[340px]"
          onAction={(key) => onDistrictChange(key as string)}
          selectedKeys={[selectedDistrict]}
          selectionMode="single"
        >
          <DropdownItem key="search-item" textValue="Search" isReadOnly className="p-0">
            <Input
              placeholder="Поиск района..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              size="sm"
              className="mb-2 px-2 py-2"
            />
          </DropdownItem>
          
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((district) => (
              <DropdownItem key={district} textValue={district}>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={district.startsWith("Все") ? "lucide:list" : "lucide:map"} 
                    className="text-default-500"
                    size={16}
                  />
                  <span>{district}</span>
                </div>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem isDisabled textValue="No results">
              Районы не найдены
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};