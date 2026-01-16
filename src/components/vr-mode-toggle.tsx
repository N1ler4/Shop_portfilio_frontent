import React from "react";
import { Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useVRMode } from "../context/VRContext";
import { useLanguage } from "../context/LanguageContext";

export const VRModeToggle: React.FC = () => {
  const { isVRMode, toggleVRMode } = useVRMode();
  const { t } = useLanguage();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleVRToggle = () => {
    if (!isVRMode) {
      onOpen(); // Show instructions before enabling VR mode
    } else {
      toggleVRMode(); // Directly disable VR mode
    }
  };

  const enableVRMode = () => {
    toggleVRMode();
    onOpenChange();
  };

  return (
    <>
      <Tooltip content={isVRMode ? t('vr.disableVR') : t('vr.enableVR')}>
        <Button
          isIconOnly
          variant={isVRMode ? "solid" : "light"}
          color={isVRMode ? "secondary" : "default"}
          aria-label={isVRMode ? t('vr.disableVR') : t('vr.enableVR')}
          onPress={handleVRToggle}
          className={isVRMode ? "animate-pulse" : ""}
        >
          <Icon icon="lucide:glasses" className="text-xl" />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t('vr.vrModeTitle')}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center mb-4">
                  <Icon icon="lucide:glasses" className="text-5xl text-secondary mb-4" />
                  <p className="text-center">{t('vr.vrModeDescription')}</p>
                </div>
                <div className="bg-content2 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{t('vr.instructions')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check-circle" className="text-success mt-0.5" />
                      <span>{t('vr.instruction1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check-circle" className="text-success mt-0.5" />
                      <span>{t('vr.instruction2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check-circle" className="text-success mt-0.5" />
                      <span>{t('vr.instruction3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:alert-triangle" className="text-warning mt-0.5" />
                      <span>{t('vr.warning')}</span>
                    </li>
                  </ul>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button color="secondary" onPress={enableVRMode}>
                  {t('vr.enterVR')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};