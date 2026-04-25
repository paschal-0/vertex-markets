export type TenantId = string;
export type SymbolCode = string;

export type Role = "TRADER" | "ADMIN" | "SUPPORT" | "FINANCE_OPS";

export interface JwtClaims {
  sub: string;
  tenantId: TenantId;
  roles: Role[];
  sessionId: string;
}

export interface TickEvent {
  type: "TickEvent";
  sequence: number;
  symbol: SymbolCode;
  price: number;
  ts: number;
  source: "UPSTREAM" | "OTC_SYNTHETIC";
}

export interface CandleEvent {
  type: "CandleEvent";
  sequence: number;
  symbol: SymbolCode;
  interval: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeEvent {
  type: "TradeEvent";
  tradeId: string;
  tenantId: TenantId;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  ts: number;
}

export interface EscrowEvent {
  type: "EscrowEvent";
  escrowId: string;
  tenantId: TenantId;
  status: "OPEN" | "FUNDED" | "RELEASED" | "DISPUTED" | "CANCELLED";
  ts: number;
}

export interface LedgerEvent {
  type: "LedgerEvent";
  tenantId: TenantId;
  journalEntryId: string;
  ts: number;
}

export interface AdminActionEvent {
  type: "AdminActionEvent";
  tenantId: TenantId;
  adminUserId: string;
  action: string;
  ts: number;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  traceId?: string;
}

