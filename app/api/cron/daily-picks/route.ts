import {
  timingSafeEqual,
} from "node:crypto";

import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

import {
  getCachedDailyPicks,
  getJapanDateKey,
} from "@/lib/screener/cache";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  300;

type CronPickSummary = {
  rank: number;
  symbol: string;
  name: string;
  assetType: string;
  score: number;
  confidence: number;
  signal: string;
  stance: string;
};

type CronSuccessResponse = {
  ok: true;
  reportDate: string;
  generatedAt: string;
  selectionVersion: string;
  candidatesScanned: number;
  qualifiedCandidates: number;
  picks: CronPickSummary[];
  warnings: string[];
};

type CronErrorResponse = {
  ok: false;
  error: string;
  reportDate: string;
  generatedAt: string;
};

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim().length >
      0
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

function isAuthorized(
  request: NextRequest,
  secret: string
): boolean {
  const authorization =
    request.headers.get(
      "authorization"
    ) ?? "";

  const expected =
    `Bearer ${secret}`;

  const authorizationBuffer =
    Buffer.from(
      authorization,
      "utf8"
    );

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8"
    );

  if (
    authorizationBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    authorizationBuffer,
    expectedBuffer
  );
}

export async function GET(
  request: NextRequest
) {
  const reportDate =
    getJapanDateKey();

  const cronSecret =
    process.env
      .CRON_SECRET
      ?.trim();

  if (!cronSecret) {
    console.error(
      "CRON_SECRET 尚未配置，定时筛选任务已拒绝执行。"
    );

    const response:
      CronErrorResponse = {
      ok: false,

      error:
        "Cron authentication is not configured.",

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

  if (
    !isAuthorized(
      request,
      cronSecret
    )
  ) {
    console.warn(
      "每日候选定时任务收到未授权请求。"
    );

    const response:
      CronErrorResponse = {
      ok: false,

      error:
        "Unauthorized cron request.",

      reportDate,

      generatedAt:
        new Date().toISOString(),
    };

    return NextResponse.json(
      response,
      {
        status: 401,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  try {
    console.log(
      `开始生成 ${reportDate} 每日投资研究候选。`
    );

    const report =
      await getCachedDailyPicks();

    const response:
      CronSuccessResponse = {
      ok: true,

      reportDate:
        report.reportDate,

      generatedAt:
        report.generatedAt,

      selectionVersion:
        report.selectionVersion,

      candidatesScanned:
        report.candidatesScanned,

      qualifiedCandidates:
        report.qualifiedCandidates,

      picks:
        report.picks.map(
          (pick) => ({
            rank:
              pick.rank,

            symbol:
              pick.asset.symbol,

            name:
              pick.asset.name,

            assetType:
              pick.asset.assetType,

            score:
              pick.score.total,

            confidence:
              pick.research
                .confidence
                ?.score ?? 0,

            signal:
              pick.research.signal,

            stance:
              pick.advice.stance,
          })
        ),

      warnings:
        report.warnings,
    };

    console.log(
      `${report.reportDate} 每日投资研究候选生成完成，` +
        `扫描 ${report.candidatesScanned} 项，` +
        `合格 ${report.qualifiedCandidates} 项，` +
        `最终选出 ${report.picks.length} 项。`
    );

    return NextResponse.json(
      response,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",

          "X-HIOS-Report-Date":
            report.reportDate,

          "X-HIOS-Selection-Version":
            report.selectionVersion,
        },
      }
    );
  } catch (error) {
    console.error(
      "每日投资研究候选定时生成失败：",
      error
    );

    const response:
      CronErrorResponse = {
      ok: false,

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
