export interface LedgerPostingInput {
  accountId: string;
  side: "DEBIT" | "CREDIT";
  amountMinor: bigint;
  assetCode: string;
}

export interface LedgerEntryInput {
  reference: string;
  tenantId: string;
  postings: LedgerPostingInput[];
}

export function assertBalancedPostings(postings: LedgerPostingInput[]) {
  const debit = postings
    .filter((p) => p.side === "DEBIT")
    .reduce((acc, p) => acc + p.amountMinor, 0n);
  const credit = postings
    .filter((p) => p.side === "CREDIT")
    .reduce((acc, p) => acc + p.amountMinor, 0n);

  if (debit !== credit) {
    throw new Error(`Ledger postings are not balanced: debit=${debit} credit=${credit}`);
  }
}

export function createLedgerEntry(input: LedgerEntryInput) {
  assertBalancedPostings(input.postings);
  return {
    journalEntryId: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString()
  };
}

