import React from "react";
import { Link as RouteLink } from "react-router-dom";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export interface Product {
  id: string;
  product_name: string;
  product_price: number;
  city: string;
  region: string;
  product_img: string;
  category: string;
  hasAR: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card 
        className="glass-card product-card transition-all duration-300"
        isPressable
        as={RouteLink}
        to={`/product/${product.id}`}
      >
        <CardBody className="p-0 overflow-hidden">
          <div className="relative">
            <img
              src={product.product_img}
              alt={product.product_name}
              className="w-full h-32 sm:h-48 object-cover"
            />
            {product.hasAR && (
              <div className="ar-badge flex items-center gap-1">
                <Icon icon="lucide:view" width={14} height={14} />
                <span className="hidden sm:inline">AR View</span>
              </div>
            )}
          </div>
          <div className="p-2 sm:p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm sm:text-lg font-semibold line-clamp-1">{product.product_name}</h3>
              <div className="flex gap-1">
                {product.isNew && (
                  <Chip size="sm" color="primary" variant="flat" className="hidden sm:flex">New</Chip>
                )}
                {product.isHot && (
                  <Chip size="sm" color="danger" variant="flat" className="hidden sm:flex">Hot</Chip>
                )}
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold text-primary mt-1 sm:mt-2">${product.product_price}</p>
            <div className="flex items-center gap-1 text-default-500 mt-1">
              <Icon icon="lucide:map-pin" width={14} height={14} />
              <span className="text-xs sm:text-sm truncate">{product.city} , {product.region}</span>
            </div>
          </div>
        </CardBody>
        <CardFooter className="flex justify-between p-2 sm:p-4">
          <Button 
            size="sm" 
            variant="flat" 
            color="primary"
            isIconOnly
            className="sm:hidden"
          >
            <Icon icon="lucide:heart" width={16} height={16} />
          </Button>
          <Button 
            size="sm" 
            variant="flat" 
            color="primary"
            startContent={<Icon icon="lucide:heart" />}
            className="text-sm hidden sm:flex"
          >
            Save
          </Button>
          <Button 
            size="sm" 
            color="primary"
            isIconOnly
            className="sm:hidden"
          >
            <Icon icon="lucide:arrow-right" width={16} height={16} />
          </Button>
          <Button 
            size="sm" 
            color="primary"
            endContent={<Icon icon="lucide:arrow-right" />}
            className="text-sm hidden sm:flex"
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};