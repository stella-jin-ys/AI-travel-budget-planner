import Decimal from "decimal.js";
import type { Money } from "./trip";

export function money(amount: string, currency: string): Money {
  return { amount: new Decimal(amount).toFixed(2), currency };
}

export function addMoney(values: Money[]): Money {
  if (values.length === 0) throw new Error("Cannot add an empty money list");
  const currency = values[0].currency;
  if (values.some((value) => value.currency !== currency)) {
    throw new Error("Cannot add mixed currencies");
  }
  return money(
    values
      .reduce((sum, value) => sum.plus(value.amount), new Decimal(0))
      .toFixed(2),
    currency,
  );
}

export function formatMoney(value: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
  }).format(new Decimal(value.amount).toNumber());
}
