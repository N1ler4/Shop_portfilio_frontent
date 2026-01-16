import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { RegionSelector } from "./region-selector";
import { CitySelector } from "./city-selector";
import { DistrictSelector } from "./district-selector";
import { Select, SelectItem } from "@heroui/react";
import { useLocation } from "../context/LocationContext";

export const LocationFilter: React.FC = () => {
  const { location, isLocationConfirmed, setLocation, confirmLocation } = useLocation();

  if (isLocationConfirmed) {
    return null;
  }

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

  // Cities by region (sample data)
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

  // Districts by city (sample data)
  const districtsByCity: Record<string, string[]> = {
    "Ташкент": ["Все районы", "Алмазарский", "Бектемирский", "Мирабадский", "Мирзо-Улугбекский", "Сергелийский", "Чиланзарский", "Шайхантахурский", "Юнусабадский", "Яккасарайский", "Яшнабадский"],
    "Самарканд": ["Все районы", "Багишамальский", "Сиабский", "Темирйульский", "Центральный"],
    "Бухара": ["Все районы", "Восточный", "Западный", "Северный", "Южный"]
  };

  // Get cities for the selected region or use default
  const cities = location.region !== "Все регионы" && citiesByRegion[location.region] 
    ? ["Выберите город", ...citiesByRegion[location.region]]
    : ["Выберите город"];
  
  // Get districts for the selected city or use default
  const districts = location.city !== "Выберите город" && districtsByCity[location.city]
    ? districtsByCity[location.city]
    : ["Выберите район"];

  const handleRegionChange = (region: string) => {
    setLocation({
      region,
      city: "Выберите город",
      district: "Выберите район"
    });
  };

  const handleCityChange = (city: string) => {
    setLocation({
      region: location.region,
      city,
      district: "Выберите район"
    });
  };

  const handleDistrictChange = (district: string) => {
    setLocation({
      region: location.region,
      city: location.city,
      district
    });
  };

  return (
    <Card className="glass-card border-none mb-4 min-w-[280px] lg:min-w-0">
      <CardBody className="p-4">
        <h3 className="text-lg font-semibold mb-4 hidden lg:block">Местоположение</h3>
        <div className="space-y-3">
          <Select
            label={<span className="lg:inline hidden">Регион</span>}
            placeholder="Выберите регион"
            selectedKeys={location.region ? [location.region] : []}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="max-w-full"
            size="sm"
          >
            {regions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </Select>
          
          <Select
            label={<span className="lg:inline hidden">Город</span>}
            placeholder="Выберите город"
            selectedKeys={location.city ? [location.city] : []}
            onChange={(e) => handleCityChange(e.target.value)}
            isDisabled={!location.region || location.region === "Все регионы"}
            className="max-w-full"
            size="sm"
          >
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </Select>
          
          <Select
            label={<span className="lg:inline hidden">Район</span>}
            placeholder="Выберите район"
            selectedKeys={location.district ? [location.district] : []}
            onChange={(e) => handleDistrictChange(e.target.value)}
            isDisabled={!location.city || location.city === "Выберите город"}
            className="max-w-full"
            size="sm"
          >
            {districts.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </Select>
          <Button color="primary" className="w-full mt-4" onPress={confirmLocation}>
            Подтвердить
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};