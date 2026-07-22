"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header
      style={{
        background: "#0b2a4a",
        color: "white",
        padding: "22px",
        borderRadius: "16px",
        marginBottom: "30px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "34px",
          lineHeight: 1.2,
        }}
      >
        {t("homeTitle")}
      </h1>

      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          opacity: 0.85,
          lineHeight: 1.6,
        }}
      >
        {t("homeSubtitle")}
      </p>
    </header>
  );
}
