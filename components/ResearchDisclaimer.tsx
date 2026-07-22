type Props = {
  version?: string;
};

export default function ResearchDisclaimer({
  version = "1.0 Beta",
}: Props) {
  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        border: "1px solid #d6e1ea",
        background: "#f7f9fb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#0b2a4a",
              fontSize: 18,
            }}
          >
            Research Disclaimer
          </h2>

          <div
            style={{
              marginTop: 4,
              color: "#60758a",
              fontSize: 13,
            }}
          >
            投资研究风险提示
          </div>
        </div>

        <div
          style={{
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px solid #c7d5e2",
            background: "#ffffff",
            color: "#52697d",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Engine {version}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          color: "#52697d",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
          }}
        >
          HIOS Research Engine
          提供的评分、趋势判断、风险等级和交易信号，仅用于辅助整理公开市场数据和投资研究，不构成证券买卖建议、收益保证或个性化投资顾问服务。
        </p>

        <p
          style={{
            margin: "0 0 10px",
          }}
        >
          行情、历史K线和基本面数据可能存在延迟、缺失、错误或数据源暂时不可用的情况。即使页面显示较高评分或买入信号，也不代表相关股票必然上涨。
        </p>

        <p
          style={{
            margin: 0,
          }}
        >
          在作出真实投资决定前，请结合公司公告、财务报告、市场环境、持仓比例和个人风险承受能力进行独立判断。投资可能产生本金损失，最终决策和风险由使用者自行承担。
        </p>
      </div>
    </section>
  );
}
