import { NextResponse } from "next/server";

import {
  getCachedDailyPicks,
  getJapanDateKey,
} from "@/lib/screener/cache";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

export const maxDuration = 300;

type ErrorResponse = {
  error: string;
  reportDate: string;
  generatedAt: string;
};

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message.trim();
  }

  if (
    typeof error === "string" &&
    error.trim().length > 0
  ) {
    return error.trim();
  }

  return (
    "Daily investment screening " +
    "could not be completed."
  );
}

export async function GET() {
  const requestStartedAt =
    new Date();

  const reportDate =
    getJapanDateKey(
      requestStartedAt
    );

  try {
    const report =
      await getCachedDailyPicks();

    return NextResponse.json(
      report,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "public, max-age=0, " +
            "s-maxage=300, " +
            "stale-while-revalidate=60",

          "X-HIOS-Report-Date":
            report.reportDate,

          "X-HIOS-Selection-Version":
            report.selectionVersion,
        },
      }
    );
  } catch (error) {
    console.error(
      "每日候选筛选接口执行失败：",
      error
    );

    const response:
      ErrorResponse = {
      error:
        getErrorMessage(
          error
        ),

      reportDate,

      generatedAt:
        new Date().toISOString(),
    };

    return NextResponse.json(
      response,
      {
        status: 503,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
