import { Signal, useSignal } from "@preact/signals";

import { IS_BROWSER } from "$fresh/runtime.ts";
import i18next from "../utils/i18next.ts";
import { useEffect } from "preact/hooks";

export function useTranslation() {
  const currentLanguage = useSignal(i18next.language);
  const translationFn = useSignal(() => i18next.t.bind(i18next));

  useEffect(() => {
    if (!IS_BROWSER) return;

    const handleLanguageChanged = (lng: string) => {
      currentLanguage.value = lng;
      translationFn.value = () => i18next.t.bind(i18next);
    };

    i18next.on("languageChanged", handleLanguageChanged);
    return () => {
      i18next.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      await i18next.changeLanguage(lang);
      currentLanguage.value = lang;
      document.documentElement.lang = lang;
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return {
    t: (...args: Parameters<typeof i18next.t>) => translationFn.value()(...args),
    i18n: i18next,
    language: currentLanguage.value,
    changeLanguage
  };
} 