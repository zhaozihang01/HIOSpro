import "server-only";

import {
  unstable_cache,
} from "next/cache";

import {
  DAILY_SELECTION_VERSION,
  generateDailyPicks,
} from "@/lib/screener/service";

import type {
  DailyPicksReport,
} from "@/lib/screener/types";

const DAILY_PICKS_CACHE_NAMESPACE =
  "hios-daily-picks";

const DAILY_PICKS_CACHE_SECONDS =
  60 * 60 * 24;

const DAILY_PICKS_MAXIMUM_CONCURRENCY =
  3;

const inFlightRequests =
  new Map<
    string,
    Promise<DailyPicksReport>
  >();

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type:
    | "year"
    | "month"
    | "day"
): string | null {
  const value =
    parts.find(
      (part) =>
        part.type === type
    )?.value;

  return value ?? null;
}

export function getJapanDateKey(
  date = new Date()
): string {
  try {
    const parts =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Tokyo",

          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).formatToParts(date);

    const year =
      getDatePart(
        parts,
        "year"
      );

    const month =
      getDatePart(
        parts,
        "month"
      );

    const day =
      getDatePart(
        parts,
        "day"
      );

    if (
      year &&
      month &&
      day
    ) {
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error(
      "日本日期生成失败，使用UTC日期作为后备值。",
      error
    );
  }

  return date
    .toISOString()
    .slice(0, 10);
}

export function getDailyPicksCacheTag(
  reportDate: string
): string {
  return (
    `${DAILY_PICKS_CACHE_NAMESPACE}:` +
    `${DAILY_SELECTION_VERSION}:` +
    reportDate
  );
}

function createCachedDailyPicksGenerator(
  reportDate: string
): () => Promise<DailyPicksReport> {
  return unstable_cache(
    async () => {
      const report =
        await generateDailyPicks({
          maximumConcurrency:
            DAILY_PICKS_MAXIMUM_CONCURRENCY,
        });

      /*
       * 使用任务开始时的日本日期作为报告日期。
       * 即使筛选过程跨过午夜，
       * 该报告仍归属于启动筛选的日期。
       */
      return {
        ...report,
        reportDate,
      };
    },

    [
      DAILY_PICKS_CACHE_NAMESPACE,
      DAILY_SELECTION_VERSION,
      reportDate,
    ],

    {
      revalidate:
        DAILY_PICKS_CACHE_SECONDS,

      tags: [
        DAILY_PICKS_CACHE_NAMESPACE,

        getDailyPicksCacheTag(
          reportDate
        ),
      ],
    }
  );
}

export async function getCachedDailyPicks(): Promise<DailyPicksReport> {
  const reportDate =
    getJapanDateKey();

  const requestKey =
    `${DAILY_SELECTION_VERSION}:` +
    reportDate;

  const existingRequest =
    inFlightRequests.get(
      requestKey
    );

  if (existingRequest) {
    return existingRequest;
  }

  const cachedGenerator =
    createCachedDailyPicksGenerator(
      reportDate
    );

  const request =
    cachedGenerator();

  inFlightRequests.set(
    requestKey,
    request
  );

  try {
    return await request;
  } finally {
    inFlightRequests.delete(
      requestKey
    );
  }
}

export {
  DAILY_PICKS_CACHE_NAMESPACE,
  DAILY_PICKS_CACHE_SECONDS,
};
