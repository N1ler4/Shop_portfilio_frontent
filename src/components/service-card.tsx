import React from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export interface Service {
  id?: string;
  serv_name?: string;
  serv_company?: string;
  avg_rating?: number;
  serv_price?: string;
  serv_location?: string;
  serv_img?: string;
  category?: [];
  serv_tags?: string[];
  company?: any
}

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card 
        className="glass-card product-card transition-all duration-300 h-full"
        isPressable
        as={Link}
        to={`/service/${service?.id}`}
      >
        <CardBody className="p-0 overflow-hidden">
          <div className="relative">
            <img
              src={service.serv_img}
              alt={service.serv_name}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-2 sm:p-4">
            <h3 className="text-sm sm:text-lg font-semibold line-clamp-1">{service.serv_name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs sm:text-sm font-medium truncate">{service?.company.company_name}</span>
              <span className="text-xs text-default-400">•</span>
              <div className="flex items-center">
                <Icon icon="lucide:star" className="text-yellow-500" style={{ fontSize: 14 }} />
                <span className="text-xs sm:text-sm ml-1">{service?.company.rate || 0}</span>
              </div>
            </div>
            <p className="text-primary font-semibold mt-1 sm:mt-2 text-sm sm:text-base">{parseFloat(service.serv_price).toFixed(0)}$/hour</p>
            <div className="flex items-center gap-1 text-default-500 mt-1">
              <Icon icon="lucide:map-pin" style={{ fontSize: 14 }} />
              <span className="text-xs sm:text-sm">{service.serv_location}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
              {service?.serv_tags?.slice(0, 2).map((tag, index) => (
                <Chip key={index} size="sm" variant="flat" color="secondary" className="text-xs">{tag}</Chip>
              ))}
            </div>
          </div>
        </CardBody>
        <CardFooter className="flex justify-between">
          <Button 
            size="sm" 
            variant="flat" 
            color="primary"
            startContent={<Icon icon="lucide:message-circle" />}
            className="text-sm"
          >
            Contact
          </Button>
          <Button 
            size="sm" 
            color="primary"
            endContent={<Icon icon="lucide:calendar" />}
            className="text-sm"
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};