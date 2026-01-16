import React from "react";
import { 
  Card, 
  CardBody, 
  Button, 
  Tabs, 
  Tab
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { ListingForm } from "../components/listing-form";

export const CreateListingDemoPage: React.FC = () => {
  const [listingType, setListingType] = React.useState<"vehicle" | "realestate">("vehicle");
  
  const handleSubmit = (data: any) => {
    // In a real app, you would send this data to your backend
    alert("Форма отправлена успешно!");
  };
  
  const handleCancel = () => {
    // In a real app, you might navigate back or clear the form
    console.log("Form cancelled");
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Создать объявление</h1>
        <p className="text-default-600 text-lg">
          Выберите тип объявления и заполните необходимые поля
        </p>
      </motion.div>
      
      <Card className="glass-card border-none mb-6">
        <CardBody>
          <Tabs 
            aria-label="Listing type" 
            selectedKey={listingType}
            onSelectionChange={(key) => setListingType(key as "vehicle" | "realestate")}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full bg-primary-200",
              tab: "max-w-fit px-2 h-12",
            }}
          >
            <Tab
              key="vehicle"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:car" />
                  <span>Транспорт</span>
                </div>
              }
            />
            <Tab
              key="realestate"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:home" />
                  <span>Недвижимость</span>
                </div>
              }
            />
          </Tabs>
        </CardBody>
      </Card>
      
      <ListingForm 
        listingType={listingType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};