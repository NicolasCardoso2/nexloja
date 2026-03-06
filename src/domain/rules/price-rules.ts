export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export function validateNonNegativePrice(price: number): ValidationResult {
  if (price < 0) {
    return { isValid: false, message: "Preco nao pode ser negativo." };
  }

  return { isValid: true };
}
