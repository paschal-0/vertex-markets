export const FOREX_SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "AUDUSD",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "EURAUD",
  "EURCHF",
  "EURCAD",
  "AUDJPY",
  "AUDCAD",
  "AUDCHF",
  "CADJPY",
  "CHFJPY",
  "NZDJPY",
  "GBPAUD",
  "GBPCAD",
  "GBPCHF",
  "NZDCAD",
  "NZDCHF",
  "EURNZD",
  "GBPNZD",
  "USDNOK",
  "USDSEK",
  "USDTRY",
  "USDMXN"
] as const;

export const OTC_SYMBOLS = FOREX_SYMBOLS.map((symbol) => `${symbol}_OTC`);
export const ALL_SYMBOLS = [...FOREX_SYMBOLS, ...OTC_SYMBOLS];

