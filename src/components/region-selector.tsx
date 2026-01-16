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
import { motion } from "framer-motion";

interface RegionSelectorProps {
  onRegionChange: (region: string) => void;
  selectedRegion: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  onRegionChange, 
  selectedRegion 
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Regions of Uzbekistan (Viloyatlar)
  const regions = [
    "Все регионы",
    "Ташкент",
    "Андижанская область",
    "Бухарская область",
    "Джизакская область",
    "Кашкадарьинская область",
    "Навоийская область",
    "Наманганская область",
    "Самаркандская область",
    "Сурхандарьинская область",
    "Сырдарьинская область",
    "Ташкентская область",
    "Ферганская область",
    "Хорезмская область",
    "Республика Каракалпакстан"
  ];

  // Cities by region (sample data - would be expanded in a real application)
  const citiesByRegion: Record<string, string[]> = {
    "Ташкент": ["Ташкент"],
    "Андижанская область": ["Андижан", "Асака", "Ханабад", "Шахрихан"],
    "Бухарская область": ["Бухара", "Каган", "Газли", "Гиждуван"],
    "Джизакская область": ["Джизак", "Галляарал", "Пахтакор"],
    "Кашкадарьинская область": ["Карши", "Шахрисабз", "Китаб", "Гузар"],
    "Навоийская область": ["Навои", "Зарафшан", "Учкудук"],
    "Наманганская область": ["Наманган", "Чуст", "Касансай", "Чартак"],
    "Самаркандская область": ["Самарканд", "Каттакурган", "Ургут"],
    "Сурхандарьинская область": ["Термез", "Денау", "Шерабад"],
    "Сырдарьинская область": ["Гулистан", "Сырдарья", "Янгиер"],
    "Ташкентская область": ["Ангрен", "Алмалык", "Бекабад", "Чирчик", "Янгиюль"],
    "Ферганская область": ["Фергана", "Коканд", "Кувасай", "Маргилан"],
    "Хорезмская область": ["Ургенч", "Хива", "Питнак"],
    "Республика Каракалпакстан": ["Нукус", "Беруни", "Турткуль", "Чимбай"]
  };

  const filteredRegions = regions.filter(region => 
    region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6">
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            color="primary"
            className="w-full justify-start"
            startContent={<Icon icon="lucide:map-pin" />}
            endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
          >
            {selectedRegion}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Regions of Uzbekistan"
          className="w-[340px]"
          onAction={(key) => onRegionChange(key as string)}
          selectedKeys={[selectedRegion]}
          selectionMode="single"
        >
          <DropdownItem key="search-item" textValue="Search" isReadOnly className="p-0">
            <Input
              placeholder="Поиск региона..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              size="sm"
              className="mb-2 px-2 py-2"
            />
          </DropdownItem>
          
          {filteredRegions.length > 0 ? (
            filteredRegions.map((region) => (
              <DropdownItem key={region} textValue={region}>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={region === "Все регионы" ? "lucide:globe" : "lucide:map-pin"} 
                    className="text-default-500"
                    size={16}
                  />
                  <span>{region}</span>
                </div>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem isDisabled textValue="No results">
              Регионы не найдены
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};