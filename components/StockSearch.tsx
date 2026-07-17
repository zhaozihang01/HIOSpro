"use client";

import { FormEvent, useState } from "react";

type Props = {
  onSearch: (symbol: string) => void;
};

export default function StockSearch({ onSearch }: Props) {
  const [symbol, setSymbol] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = symbol.trim().toUpperCase();

    if (!value) {
      return;
    }

    onSearch(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 24,
        padding: 16,
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 14,
      }}
    >
      <input
        value={symbol}
        onChange={(event) => setSymbol(event.target.value)}
        placeholder="输入股票代码，例如 7203.T、MSFT、NVDA"
        aria-label="股票代码"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "12px 14px",
          border: "1px solid #c7d4df",
          borderRadius: 10,
          fontSize: 16,
          outline: "none",
        }}
      />

      <button
        type="submit"
        style={{
          border: 0,
          borderRadius: 10,
          padding: "12px 20px",
          background: "#0b2a4a",
          color: "#ffffff",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        查询
      </button>
    </form>
  );
}
