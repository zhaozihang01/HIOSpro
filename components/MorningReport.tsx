"use client";

import {
  useEffect,
  useState,
} from "react";

import { useLanguage } from "@/components/LanguageProvider";

import {
  getMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/marketService";

import {
  generateMarketAnalysis,
} from "@/lib/analysis";

import type {
  TranslationMessages,
  TranslationParams,
} from "@/lib/i18n";

type MarketAnalysis = ReturnType<
  typeof generateMarketAnalysis
>;

type TranslateFunction = (
  key: keyof TranslationMessages,
  params?: TranslationParams
) => string;

type ReportError =
  | ""
  | "time"
  | "market"
  | "analysis";

function isValidNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function formatPercent(
  value: unknown,
  unavailableText: string
): string {
  if (!isValidNumber(value)) {
    return unavailableText;
  }

  const sign =
    value >= 0 ? "+" : "";

  return `${sign}${value.toFixed(
    2
  )}%`;
}

function formatNumber(
  value: unknown,
  unavailableText: string
): string {
  if (!isValidNumber(value)) {
    return unavailableText;
  }

  return value.toFixed(2);
}

function getMarketDirectionText(
  market: MarketSnapshot,
  t: TranslateFunction
): string {
  const nikkei =
    market.nikkei;

  const topix =
    market.topix;

  if (
    isValidNumber(nikkei) &&
    isValidNumber(topix)
  ) {
    if (
      nikkei > 0 &&
      topix > 0
    ) {
      return t(
        "morningReportMarketStrong"
      );
    }

    if (
      nikkei < 0 &&
      topix < 0
    ) {
      return t(
        "morningReportMarketWeak"
      );
    }
  }

  return t(
    "morningReportMarketMixed"
  );
}

function getCurrencyText(
  analysis: MarketAnalysis | null,
  t: TranslateFunction
): string {
  if (!analysis?.summary) {
    return "";
  }

  const sourceText =
    analysis.summary.toLowerCase();

  const describesWeakYen =
    sourceText.includes(
      "日元处于偏弱"
    ) ||
    sourceText.includes(
      "日元偏弱"
    ) ||
    sourceText.includes(
      "円安"
    ) ||
    sourceText.includes(
      "weak yen"
    );

  if (describesWeakYen) {
    return t(
      "morningReportYenWeak"
    );
  }

  const describesStrongYen =
    sourceText.includes(
      "日元相对偏强"
    ) ||
    sourceText.includes(
      "日元偏强"
    ) ||
    sourceText.includes(
      "円高"
    ) ||
    sourceText.includes(
      "strong yen"
    );

  if (describesStrongYen) {
    return t(
      "morningReportYenStrong"
    );
  }

  return "";
}

function getLocalizedSummary(
  locale: "zh" | "ja",
  market: MarketSnapshot | null,
  analysis: MarketAnalysis | null,
  t: TranslateFunction
): string {
  if (!analysis) {
    return locale === "ja"
      ? "AI分析を生成中、または一時的に利用できません。"
      : "AI分析正在生成或暂时不可用。";
  }

  if (locale === "zh") {
    return analysis.summary;
  }

  if (!market) {
    return t(
      "errorExternalService"
    );
  }

  const marketText =
    getMarketDirectionText(
      market,
      t
    );

  const currencyText =
    getCurrencyText(
      analysis,
      t
    );

  return [
    marketText,
    currencyText,
  ]
    .filter(
      (text) =>
        text.length > 0
    )
    .join(" ");
}

function getLocalizedRisk(
  locale: "zh" | "ja",
  analysis: MarketAnalysis | null,
  t: TranslateFunction
): string {
  if (!analysis?.risk) {
    return "";
  }

  if (locale === "zh") {
    return analysis.risk;
  }

  return t(
    "morningReportVolatilityHigh"
  );
}

function getLocalizedStrategy(
  locale: "zh" | "ja",
  analysis: MarketAnalysis | null,
  t: TranslateFunction
): string {
  if (!analysis?.strategy) {
    return "";
  }

  if (locale === "zh") {
    return analysis.strategy;
  }

  return t(
    "morningReportStrategy"
  );
}

function getErrorText(
  error: ReportError,
  locale: "zh" | "ja",
  t: TranslateFunction
): string {
  switch (error) {
    case "time":
      return locale === "ja"
        ? "日本時間を取得できません。"
        : "日本时间读取失败。";

    case "market":
      return t(
        "errorExternalService"
      );

    case "analysis":
      return locale === "ja"
        ? "AI分析を一時的に生成できません。"
        : "AI分析暂时无法生成。";

    default:
      return "";
  }
}

export default function MorningReport() {
  const {
    locale,
    t,
  } = useLanguage();

  const [
    japanTime,
    setJapanTime,
  ] = useState("");

  const [
    market,
    setMarket,
  ] =
    useState<MarketSnapshot | null>(
      null
    );

  const [
    analysis,
    setAnalysis,
  ] =
    useState<MarketAnalysis | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<ReportError>("");

  useEffect(() => {
    function updateJapanTime() {
      try {
        const now =
          new Date();

        const formatted =
          new Intl.DateTimeFormat(
            locale === "ja"
              ? "ja-JP"
              : "zh-CN",
            {
              timeZone:
                "Asia/Tokyo",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }
          ).format(now);

        setJapanTime(
          `${formatted} JST`
        );

        setError(
          (current) =>
            current === "time"
              ? ""
              : current
        );
      } catch (timeError) {
        console.error(
          "日本时间读取失败：",
          timeError
        );

        setJapanTime("");
        setError("time");
      }
    }

    updateJapanTime();

    const timer =
      window.setInterval(
        updateJapanTime,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [locale]);

  useEffect(() => {
    let cancelled =
      false;

    async function loadMorningReport() {
      try {
        setError("");

        const snapshot =
          await getMarketSnapshot();

        if (cancelled) {
          return;
        }

        setMarket(snapshot);

        try {
          const generatedAnalysis =
            generateMarketAnalysis(
              snapshot
            );

          if (!cancelled) {
            setAnalysis(
              generatedAnalysis
            );
          }
        } catch (
          analysisError
        ) {
          console.error(
            "市场分析生成失败：",
            analysisError
          );

          if (!cancelled) {
            setAnalysis(null);
            setError(
              "analysis"
            );
          }
        }
      } catch (
        marketError
      ) {
        console.error(
          "市场数据读取失败：",
          marketError
        );

        if (!cancelled) {
          setMarket(null);
          setAnalysis(null);
          setError("market");
        }
      }
    }

    void loadMorningReport();

    return () => {
      cancelled = true;
    };
  }, []);

  const unavailableText =
    t("commonUnavailable");

  const summaryText =
    getLocalizedSummary(
      locale,
      market,
      analysis,
      t
    );

  const riskText =
    getLocalizedRisk(
      locale,
      analysis,
      t
    );

  const strategyText =
    getLocalizedStrategy(
      locale,
      analysis,
      t
    );

  const errorText =
    getErrorText(
      error,
      locale,
      t
    );

  return (
    <section
      style={{
        background: "#ffffff",
        border:
          "1px solid #d6e1ea",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          margin:
            "0 0 12px 0",
          color: "#0b2a4a",
        }}
      >
        🌅{" "}
        {t(
          "morningReportTitle"
        )}
      </h2>

      <div
        style={{
          color: "#666",
          marginBottom: 16,
        }}
      >
        {japanTime ||
          `${t(
            "commonLoading"
          )}…`}
      </div>

      {errorText && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: "#fff5f5",
            border:
              "1px solid #f1c2c2",
            color: "#c94343",
            lineHeight: 1.6,
          }}
        >
          {errorText}
        </div>
      )}

      <div
        style={{
          lineHeight: 1.8,
        }}
      >
        <div>
          📈 Nikkei 225　
          {market
            ? formatPercent(
                market.nikkei,
                unavailableText
              )
            : "..."}
        </div>

        <div>
          📈 TOPIX　　　
          {market
            ? formatPercent(
                market.topix,
                unavailableText
              )
            : "..."}
        </div>

        <div>
          💵 USD/JPY　　
          {market
            ? formatNumber(
                market.usdJpy,
                unavailableText
              )
            : "..."}
        </div>
      </div>

      <hr
        style={{
          margin:
            "16px 0",
        }}
      />

      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {t(
          "morningReportSummaryTitle"
        )}
      </div>

      <div
        style={{
          color: "#333",
          lineHeight: 1.8,
        }}
      >
        {summaryText}
      </div>

      {riskText && (
        <>
          <br />

          <div
            style={{
              color: "#333",
              lineHeight: 1.8,
            }}
          >
            {riskText}
          </div>
        </>
      )}

      {strategyText && (
        <>
          <br />

          <div
            style={{
              color: "#333",
              lineHeight: 1.8,
            }}
          >
            {strategyText}
          </div>
        </>
      )}
    </section>
  );
}
