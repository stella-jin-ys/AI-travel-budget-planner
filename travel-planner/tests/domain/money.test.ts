import { describe, expect, it } from "vitest";
import { addMoney, money } from "@/features/trips/domain/money";

describe("addMoney", () => {
  it("adds decimal amounts without floating-point drift", () => {
    expect(addMoney([money("0.10", "CHF"), money("0.20", "CHF")])).toEqual(
      money("0.30", "CHF"),
    );
  });

  it("rejects mixed currencies", () => {
    expect(() =>
      addMoney([money("10.00", "CHF"), money("10.00", "EUR")]),
    ).toThrow("Cannot add mixed currencies");
  });
});
