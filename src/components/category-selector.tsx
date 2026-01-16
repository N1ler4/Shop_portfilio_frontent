import React, { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import useProductStore from "../store/product";

interface Category {
  id: string;
  icon: string;
  category_name: string;
}

interface CategorySelectorProps {
  onCategoryChange: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategoryChange,
}) => {
  const [selected, setSelected] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const { getProductCategories } = useProductStore();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getProductCategories();
        setCategories([{ id: "all", category_name: "Все" }, ...response]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelected(categoryId);
    onCategoryChange(categoryId);
  };

  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();

    // Ключи соответствуют отображению и переводу
    if (["все", "all"].includes(name)) return "lucide:layout-grid";
    if (["электроника", "electronics"].includes(name))
      return "lucide:smartphone";
    if (["мебель", "furniture"].includes(name)) return "lucide:home";
    if (["одежда", "clothing"].includes(name)) return "lucide:shirt";
    if (["транспорт", "vehicles", "авто"].includes(name)) return "lucide:car";
    if (["услуги", "services"].includes(name)) return "lucide:settings";
    if (["недвижимость", "realestate", "real estate"].includes(name))
      return "lucide:building";
    if (["работа", "jobs"].includes(name)) return "lucide:briefcase";
    if (["сельхоз", "agriculture"].includes(name)) return "lucide:wheat";
    if (["отдам даром", "free"].includes(name)) return "lucide:gift";
    if (["бизнес", "бизнес и услуги", "business"].includes(name))
      return "lucide:factory";
    if (["для детей", "kids"].includes(name)) return "lucide:baby";

    // fallback иконка
    return "lucide:box";
  };

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {categories?.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryChange(category.id)}
            className={`cursor-pointer ${
              selected === category.id
                ? "category-tile-selected"
                : "category-tile"
            }`}
          >
            <Card
              className={`h-full w-full border-none flex flex-col items-center justify-center py-3 px-2 ${
                selected === category.id
                  ? "bg-primary/10 shadow-md"
                  : "glass-card"
              }`}
            >
              <Icon
                icon={getCategoryIcon(category.category_name)}
                width={24}
                height={24}
                className={`mb-2 ${
                  selected === category.id ? "text-primary" : "text-default-600"
                }`}
              />
              <span
                className={`text-xs text-center font-medium ${
                  selected === category.id ? "text-primary" : "text-default-600"
                }`}
              >
                {category.category_name}
              </span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
