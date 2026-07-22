"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  detectLocaleFromLanguage,
  getTranslations,
  isLocale,
  translate,
  type Locale,
  type TranslationMessages,
  type TranslationParams,
} from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY =
  "hios-locale";

type TranslationKey =
  keyof TranslationMessages;

type LanguageContextValue = {
  locale: Locale;
  messages: TranslationMessages;
  setLocale: (
    locale: Locale
  ) => void;
  toggleLocale: () => void;
  t: (
    key: TranslationKey,
    params?: TranslationParams
  ) => string;
  isReady: boolean;
};

const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);

type Props = {
  children: ReactNode;
};

function getInitialBrowserLocale(): Locale {
  if (
    typeof window === "undefined"
  ) {
    return DEFAULT_LOCALE;
  }

  try {
    const savedLocale =
      window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY
      );

    if (isLocale(savedLocale)) {
      return savedLocale;
    }
  } catch {
    // localStorage不可用时继续读取浏览器语言
  }

  return detectLocaleFromLanguage(
    window.navigator.language
  );
}

export default function LanguageProvider({
  children,
}: Props) {
  const [locale, setLocaleState] =
    useState<Locale>(
      DEFAULT_LOCALE
    );

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    const initialLocale =
      getInitialBrowserLocale();

    setLocaleState(initialLocale);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    document.documentElement.lang =
      locale === "ja"
        ? "ja"
        : "zh-CN";

    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        locale
      );
    } catch {
      // localStorage不可用时不影响语言切换
    }
  }, [
    locale,
    isReady,
  ]);

  const setLocale =
    useCallback(
      (
        nextLocale: Locale
      ) => {
        setLocaleState(
          nextLocale
        );
      },
      []
    );

  const toggleLocale =
    useCallback(() => {
      setLocaleState(
        (currentLocale) =>
          currentLocale === "zh"
            ? "ja"
            : "zh"
      );
    }, []);

  const t = useCallback(
    (
      key: TranslationKey,
      params?: TranslationParams
    ): string => {
      return translate(
        locale,
        key,
        params
      );
    },
    [locale]
  );

  const messages = useMemo(
    () =>
      getTranslations(locale),
    [locale]
  );

  const value =
    useMemo<LanguageContextValue>(
      () => ({
        locale,
        messages,
        setLocale,
        toggleLocale,
        t,
        isReady,
      }),
      [
        locale,
        messages,
        setLocale,
        toggleLocale,
        t,
        isReady,
      ]
    );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}
