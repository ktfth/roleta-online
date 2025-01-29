import { h } from "preact";
import { useSignal } from "@preact/signals";
import { useTranslation } from "../hooks/useTranslation.ts";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslation();
  const isChanging = useSignal(false);

  const toggleLanguage = async () => {
    if (isChanging.value) return;
    
    try {
      isChanging.value = true;
      const newLang = language === "pt-BR" ? "en-US" : "pt-BR";
      await changeLanguage(newLang);
    } finally {
      isChanging.value = false;
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isChanging.value}
      class="fixed top-4 right-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={language === "pt-BR" ? "Switch to English" : "Mudar para Português"}
    >
      {isChanging.value ? "..." : language === "pt-BR" ? "EN" : "PT"}
    </button>
  );
} 