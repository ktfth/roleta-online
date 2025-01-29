import { type PageProps } from "$fresh/server.ts";
import LanguageSwitcher from "../islands/LanguageSwitcher.tsx";
import { getLanguage } from "../utils/i18n.ts";

export default function App({ Component }: PageProps) {
  const lang = getLanguage();
  
  return (
    <html lang={lang}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>roleta-online</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="relative">
          <div class="absolute top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          <Component />
        </div>
      </body>
    </html>
  );
}
