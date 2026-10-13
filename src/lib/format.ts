export function formatPKR(amount: number): string {
  return `Rs ${Math.round(amount || 0).toLocaleString('en-PK')}`;
}
