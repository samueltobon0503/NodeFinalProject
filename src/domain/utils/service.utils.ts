const CURRENCY = "COP";

export function formatPrice(value: string | number): string {
  console.log("Preciosinho", value)
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    throw new Error("Precio inválido");
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}