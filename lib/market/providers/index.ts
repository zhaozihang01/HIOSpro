import { YahooProvider } from "./yahoo";
import { FinnhubProvider } from "./finnhub";

export const providers = {
  yahoo: new YahooProvider(),
  finnhub: new FinnhubProvider(),
};

export type ProviderName = keyof typeof providers;
