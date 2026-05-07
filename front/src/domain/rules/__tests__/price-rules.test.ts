import { describe, it, expect } from 'vitest';
import { validateNonNegativePrice } from '../price-rules';

describe('price-rules', () => {
  describe('validateNonNegativePrice', () => {
    it('deve retornar válido para preço zero', () => {
      const result = validateNonNegativePrice(0);
      expect(result.isValid).toBe(true);
    });

    it('deve retornar válido para preço positivo', () => {
      const result = validateNonNegativePrice(100);
      expect(result.isValid).toBe(true);
    });

    it('deve retornar válido para preço decimal', () => {
      const result = validateNonNegativePrice(99.99);
      expect(result.isValid).toBe(true);
    });

    it('deve retornar inválido para preço negativo', () => {
      const result = validateNonNegativePrice(-1);
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('deve retornar inválido para preço muito negativo', () => {
      const result = validateNonNegativePrice(-1000);
      expect(result.isValid).toBe(false);
    });

    it('deve retornar válido para preço muito alto', () => {
      const result = validateNonNegativePrice(999999.99);
      expect(result.isValid).toBe(true);
    });

    it('deve ter mensagem clara para preço inválido', () => {
      const result = validateNonNegativePrice(-50);
      expect(result.message).toContain('negativo');
    });
  });
});
