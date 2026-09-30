export function toPaise(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

export function sumAmounts(amounts: number[]): number {
  const total = amounts.reduce((sum, amount) => sum + toPaise(amount), 0);
  return fromPaise(total);
}

/** Remaining salary after advances and payments. Never negative. */
export function salaryRemaining(
  gross: number,
  advances: number,
  payments: number
): number {
  const remaining = toPaise(gross) - toPaise(advances) - toPaise(payments);
  return fromPaise(Math.max(0, remaining));
}

export function exceedsRemaining(
  gross: number,
  advances: number,
  payments: number,
  nextAmount: number
): boolean {
  return (
    toPaise(gross) - toPaise(advances) - toPaise(payments) - toPaise(nextAmount) <
    0
  );
}
