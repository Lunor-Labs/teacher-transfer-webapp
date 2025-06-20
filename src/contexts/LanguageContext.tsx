import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
];

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    appName: 'Guru Mithuru',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    subject: 'Subject',
    currentProvince: 'Current Province',
    currentDistrict: 'Current District',
    currentSchool: 'Current School',
    desiredProvince: 'Desired Province',
    desiredDistrict: 'Desired District',
    gradeTaught: 'Grade Taught',
    schoolType: 'School Type',
    whatsappNumber: 'WhatsApp Number',
    hideContact: 'Hide Contact Information',
    createProfile: 'Create Profile',
    updateProfile: 'Update Profile',
    findMatches: 'Find Matches',
    matchingTeachers: 'Matching Teachers',
    contactViaWhatsApp: 'Contact via WhatsApp',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
    noMatches: 'No matching teachers found',
    mutualMatch: 'Mutual Match Available'
  },
  si: {
    appName: 'ගුරු මිතුරු',
    login: 'පිවිසෙන්න',
    register: 'ලියාපදිංචි වන්න',
    email: 'විද්‍යුත් තැපැල්',
    password: 'මුරපදය',
    fullName: 'සම්පූර්ණ නම',
    subject: 'විෂය',
    currentProvince: 'වත්මන් පළාත',
    currentDistrict: 'වත්මන් දිස්ත්‍රික්කය',
    currentSchool: 'වත්මන් පාසල',
    desiredProvince: 'අපේක්ෂිත පළාත',
    desiredDistrict: 'අපේක්ෂිත දිස්ත්‍රික්කය',
    gradeTaught: 'ඉගැන්වන ශ්‍රේණිය',
    schoolType: 'පාසල් වර්ගය',
    whatsappNumber: 'WhatsApp අංකය',
    hideContact: 'සම්බන්ධතා තොරතුරු සඟවන්න',
    createProfile: 'පැතිකඩ සාදන්න',
    updateProfile: 'පැතිකඩ යාවත්කාලීන කරන්න',
    findMatches: 'ගැලපීම් සොයන්න',
    matchingTeachers: 'ගැලපෙන ගුරුවරුන්',
    contactViaWhatsApp: 'WhatsApp හරහා සම්බන්ධ වන්න',
    adminDashboard: 'පරිපාලක උපකරණ පැනලය',
    logout: 'වරන්න',
    noMatches: 'ගැලපෙන ගුරුවරුන් සිටිනු නොලැබේ',
    mutualMatch: 'අන්‍යෝන්‍ය ගැලපීම් ඇත'
  },
  ta: {
    appName: 'குரு மித்ரு',
    login: 'உள்நுழைய',
    register: 'பதிவு செய்க',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    fullName: 'முழு பெயர்',
    subject: 'பாடம்',
    currentProvince: 'தற்போதைய மாகாணம்',
    currentDistrict: 'தற்போதைய மாவட்டம்',
    currentSchool: 'தற்போதைய பள்ளி',
    desiredProvince: 'விரும்பிய மாகாணம்',
    desiredDistrict: 'விரும்பிய மாவட்டம்',
    gradeTaught: 'கற்பிக்கும் வகுப்பு',
    schoolType: 'பள்ளி வகை',
    whatsappNumber: 'WhatsApp எண்',
    hideContact: 'தொடர்பு தகவலை மறை',
    createProfile: 'சுயவிவரம் உருவாக்க',
    updateProfile: 'சுயவிவரம் புதுப்பிக்க',
    findMatches: 'பொருத்தங்களைக் கண்டறி',
    matchingTeachers: 'பொருந்தும் ஆசிரியர்கள்',
    contactViaWhatsApp: 'WhatsApp வழியாக தொடர்பு கொள்ள',
    adminDashboard: 'நிர்வாக பலகை',
    logout: 'வெளியேறு',
    noMatches: 'பொருந்தும் ஆசிரியர்கள் இல்லை',
    mutualMatch: 'பரஸ்பர பொருத்தம் கிடைக்கும்'
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]); // Default to English

  const t = (key: string): string => {
    return translations[currentLanguage.code][key] || key;
  };

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};