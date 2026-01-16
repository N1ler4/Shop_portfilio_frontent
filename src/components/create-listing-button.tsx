import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as RouteLink } from "react-router-dom";

export const CreateListingButton: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:hidden">
      <Button
        as={RouteLink}
        to="/create-listing"
        color="primary"
        size="lg"
        className="w-full rounded-full shadow-lg"
        startContent={<Icon icon="lucide:plus-circle" />}
      >
        Выложить объявление
      </Button>
    </div>
  );
};