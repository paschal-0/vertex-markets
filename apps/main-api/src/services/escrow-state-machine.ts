export type EscrowStatus = "OPEN" | "FUNDED" | "RELEASED" | "DISPUTED" | "CANCELLED";

const validTransitions: Record<EscrowStatus, EscrowStatus[]> = {
  OPEN: ["FUNDED", "CANCELLED"],
  FUNDED: ["RELEASED", "DISPUTED", "CANCELLED"],
  RELEASED: [],
  DISPUTED: ["RELEASED", "CANCELLED"],
  CANCELLED: []
};

export function canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return validTransitions[from].includes(to);
}

export function transitionEscrow(from: EscrowStatus, to: EscrowStatus): EscrowStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid escrow transition ${from} -> ${to}`);
  }
  return to;
}

