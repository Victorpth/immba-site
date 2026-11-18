const storageKey = "immba-marketplace-cart";

export type CartLine = { listingId: string; quantity: number };

function sameLine(line: CartLine) {
  return typeof line.listingId === "string" && Number.isInteger(line.quantity) && line.quantity > 0;
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(sameLine).slice(0, 20);
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(lines.slice(0, 20)));
}

export function addToCart(listingId: string, quantity: number, stock: number) {
  const nextQuantity = Math.min(stock, Math.max(1, quantity));
  const lines = readCart().filter((line) => line.listingId !== listingId);
  lines.push({ listingId, quantity: nextQuantity });
  writeCart(lines);
}
