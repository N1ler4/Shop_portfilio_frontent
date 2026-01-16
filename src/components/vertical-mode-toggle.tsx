import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useHistory } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export const VerticalModeToggle: React.FC = () => {
  const { t } = useLanguage();
  const history = useHistory();

  const handleToggle = () => {
    history.push("/vertical");
  };

  return (
    <Tooltip content={t('vertical.enterVerticalMode')}>
      <Button
        isIconOnly
        variant="light"
        aria-label={t('vertical.enterVerticalMode')}
        onPress={handleToggle}
      >
        <span className="font-bold text-xl">V</span>
      </Button>
    </Tooltip>
  );
};