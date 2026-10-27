export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function builtyBalance(freightAmount: number, advanceAmount: number): number {
  return roundMoney(roundMoney(freightAmount) - roundMoney(advanceAmount));
}

export function advanceWithinFreight(freightAmount: number, advanceAmount: number): boolean {
  return freightAmount >= 0 && advanceAmount >= 0 && advanceAmount <= freightAmount;
}

export function formatBuiltyAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatBuiltyPdfAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
}
