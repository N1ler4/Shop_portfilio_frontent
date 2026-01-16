import React from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  const languages: LanguageOption[] = [
    { code: 'ru', name: 'Русский', flag: 'logos:russia' },
    { code: 'uz', name: 'O\'zbek', flag: 'logos:uzbekistan' },
    { code: 'en', name: 'English', flag: 'logos:usa' },
    { code: 'tr', name: 'Türkçe', flag: 'logos:turkey' },
    { code: 'zh', name: '中文', flag: 'logos:china' }
  ];
  
  const selectedLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="light" 
          className="min-w-[120px]"
          startContent={
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon icon={selectedLanguage.flag} className="text-xl" />
            </motion.div>
          }
          endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
        >
          {selectedLanguage.name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Language selection"
        onAction={(key) => setLanguage(key as Language)}
        selectedKeys={[language]}
        selectionMode="single"
        className="min-w-[180px]"
      >
        {languages.map((lang) => (
          <DropdownItem 
            key={lang.code} 
            startContent={<Icon icon={lang.flag} className="text-xl" />}
            description={lang.code === language ? "Active" : ""}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
