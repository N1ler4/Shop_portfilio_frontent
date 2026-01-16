import React from "react";
import { Icon } from "@iconify/react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = "md",
  readOnly = true,
  onChange
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };
  
  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverValue(index);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };
  
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };
  
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = (hoverValue !== null ? starValue <= hoverValue : starValue <= value);
        const isHalfFilled = !isFilled && starValue <= value + 0.5;
        
        return (
          <span
            key={index}
            className={`${sizeClasses[size]} ${!readOnly ? "cursor-pointer" : ""}`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <Icon
              icon={isFilled ? "lucide:star" : isHalfFilled ? "lucide:star-half" : "lucide:star"}
              className={isFilled || isHalfFilled ? "text-yellow-500" : "text-default-300"}
            />
          </span>
        );
      })}
    </div>
  );
};