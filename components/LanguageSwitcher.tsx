"use client";

import { useLanguage } from "@/components/LanguageProvider";

import type { Locale } from "@/lib/i18n";

type LanguageOption = {
  locale: Locale;
  label: string;
};

export default function LanguageSwitcher() {
  const {
    locale,
    setLocale,
    t,
    isReady,
  } = useLanguage();

  const options: LanguageOption[] = [
    {
      locale: "zh",
      label: t("languageChinese"),
    },
    {
      locale: "ja",
      label: t("languageJapanese"),
    },
  ];

  return (
    <div
      role="group"
      aria-label={t(
        "languageSwitcherLabel"
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: 10,
        border:
          "1px solid #c7d5e2",
        background: "#ffffff",
      }}
    >
      {options.map((option) => {
        const isActive =
          locale === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            disabled={!isReady}
            aria-pressed={isActive}
            onClick={() => {
              setLocale(
                option.locale
              );
            }}
            style={{
              minWidth: 72,
              padding: "8px 12px",
              border: 0,
              borderRadius: 7,
              background: isActive
                ? "#0b2a4a"
                : "transparent",
              color: isActive
                ? "#ffffff"
                : "#52697d",
              fontSize: 13,
              fontWeight: 800,
              cursor: isReady
                ? "pointer"
                : "default",
              opacity: isReady
                ? 1
                : 0.65,
              transition:
                "background 0.2s ease, color 0.2s ease",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
