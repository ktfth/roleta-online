import { useTranslation } from "../hooks/useTranslation.ts";

interface BackButtonProps {
  style?: "chat" | "default";
}

export default function BackButton({ style = "default" }: BackButtonProps) {
  const { t } = useTranslation();

  return (
    <button 
      onClick={() => {
        window.location.href = "/";
      }}
      class={style === "chat" 
        ? "px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        : "text-gray-800 hover:text-gray-600 font-medium cursor-pointer"}
    >
      {style === "chat" ? t("common.back") : `← ${t("common.back")}`}
    </button>
  );
} 