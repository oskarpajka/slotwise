"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, type Locale, locales } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();
  const router = useRouter();

  function switchTo(locale: Locale) {
    // biome-ignore lint/suspicious/noDocumentCookie: plain cookie works in every browser, unlike the Cookie Store API
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    router.refresh();
  }

  return (
    <fieldset className="flex gap-1">
      <legend className="sr-only">{t("label")}</legend>
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === current ? "default" : "outline"}
          size="sm"
          aria-pressed={locale === current}
          onClick={() => switchTo(locale)}
        >
          {locale.toUpperCase()}
          <span className="sr-only">{t(locale)}</span>
        </Button>
      ))}
    </fieldset>
  );
}
