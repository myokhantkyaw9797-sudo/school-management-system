import { create } from 'zustand';

interface LanguageState {
  language: 'en' | 'mm';
  setLanguage: (lang: 'en' | 'mm') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en', 
  setLanguage: (lang) => set({ language: lang }),
}));