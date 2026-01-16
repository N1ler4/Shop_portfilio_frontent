import React from 'react';
import { Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center"
    >
      <div className="relative h-6 w-12 flex items-center">
        <Switch 
          isSelected={isDark}
          onValueChange={toggleTheme}
          size="sm"
          color="secondary"
          aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
          classNames={{
            base: "!bg-gradient-to-r",
            wrapper: isDark ? "from-indigo-600 to-purple-600" : "from-amber-400 to-orange-400",
            thumb: "shadow-lg flex items-center justify-center",
            startContent: "text-white",
            endContent: "text-white"
          }}
          startContent={<Icon icon="lucide:sun" style={{ fontSize: 12 }} />}
          endContent={<Icon icon="lucide:moon" style={{ fontSize: 12 }} />}
        />
      </div>
    </motion.div>
  );
};