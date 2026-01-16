import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useVRMode } from "../context/VRContext";
import { useLanguage } from "../context/LanguageContext";

export const VROverlay: React.FC = () => {
  const { isVRMode, toggleVRMode } = useVRMode();
  const { t } = useLanguage();
  
  if (!isVRMode) return null;
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* VR Mode UI Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <Icon icon="lucide:glasses" />
          <span className="text-sm font-medium">{t('vr.vrModeActive')}</span>
        </motion.div>
      </div>
      
      {/* VR Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/70 backdrop-blur-md rounded-full p-2 flex items-center gap-2"
        >
          <Button
            isIconOnly
            color="default"
            variant="flat"
            size="sm"
            aria-label={t('vr.lookLeft')}
            className="bg-white/20"
          >
            <Icon icon="lucide:chevron-left" />
          </Button>
          
          <Button
            color="danger"
            variant="solid"
            size="sm"
            onPress={toggleVRMode}
            className="px-4"
            startContent={<Icon icon="lucide:x" />}
          >
            {t('vr.exitVR')}
          </Button>
          
          <Button
            isIconOnly
            color="default"
            variant="flat"
            size="sm"
            aria-label={t('vr.lookRight')}
            className="bg-white/20"
          >
            <Icon icon="lucide:chevron-right" />
          </Button>
        </motion.div>
      </div>
      
      {/* VR Cursor */}
      <div className="vr-cursor"></div>
      
      {/* VR Grid Lines (for depth perception) */}
      <div className="vr-grid"></div>
    </div>
  );
};