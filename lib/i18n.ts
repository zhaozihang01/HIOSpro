export type Language = "zh" | "ja";

export const translations = {
  zh: {
    title: "HIOS Morning Research",
    subtitle: "专业日本股票研究平台",
    languageName: "中文",
    market: "市场",
    price: "最新价",
    change: "涨跌幅",
    analysis: "AI分析",
    buy: "买入",
    wait: "观察",
    avoid: "回避",
    tokioMarine: "东京海上HD",
    tokioMarineSummary:
      "保险行业龙头，长期趋势保持向上，目前位于75日均线上方，属于重点观察对象。",
    microsoft: "微软",
    microsoftSummary:
      "AI与云业务继续推动业绩增长，但短线涨幅较大，建议等待更好的买入位置。",
    broadcom: "博通",
    broadcomSummary:
      "AI基础设施需求依旧强劲，中长期逻辑没有改变，可持续关注。",
  },

  ja: {
    title: "HIOS Morning Research",
    subtitle: "日本株式リサーチプラットフォーム",
    languageName: "日本語",
    market: "市場",
    price: "現在値",
    change: "前日比",
    analysis: "AI分析",
    buy: "買い",
    wait: "様子見",
    avoid: "回避",
    tokioMarine: "東京海上HD",
    tokioMarineSummary:
      "保険業界のリーダーであり、長期トレンドは上向きです。現在は75日移動平均線の上で推移しており、注目銘柄です。",
    microsoft: "マイクロソフト",
    microsoftSummary:
      "AIとクラウド事業が業績成長をけん引していますが、短期的な上昇幅が大きいため、より良い買い場を待ちます。",
    broadcom: "ブロードコム",
    broadcomSummary:
      "AIインフラ需要は引き続き強く、中長期の投資シナリオに大きな変化はありません。",
  },
} as const;
