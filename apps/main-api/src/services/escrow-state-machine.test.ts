import { describe, expect, it } from "vitest";
import { canTransition, transitionEscrow } from "./escrow-state-machine";

describe("escrow state machine", () => {
  it("allows OPEN -> FUNDED", () => {
    expect(canTransition("OPEN", "FUNDED")).toBe(true);
    expect(transitionEscrow("OPEN", "FUNDED")).toBe("FUNDED");
  });

  it("blocks RELEASED -> OPEN", () => {
    expect(canTransition("RELEASED", "OPEN")).toBe(false);
    expect(() => transitionEscrow("RELEASED", "OPEN")).toThrowError();
  });
});

