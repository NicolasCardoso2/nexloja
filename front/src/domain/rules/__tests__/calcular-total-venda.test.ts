import { describe, it, expect } from 'vitest';
import { calcularTotalVenda } from '../calcular-total-venda';
import type { ItemVendaEntity } from '@/domain/entities/item-venda';

describe('calcular-total-venda', () => {
  describe('calcularTotalVenda', () => {
    const item1: ItemVendaEntity = {
      produto_id: 1,
      produto_nome: 'Produto A',
      produto_codigo: 'COD-A',
      quantidade: 2,
      preco_unitario: 100,
      subtotal: 200,
    };

    const item2: ItemVendaEntity = {
      produto_id: 2,
      produto_nome: 'Produto B',
      produto_codigo: 'COD-B',
      quantidade: 3,
      preco_unitario: 50,
      subtotal: 150,
    };

    it('deve calcular total sem desconto', () => {
      const result = calcularTotalVenda([item1, item2], 0);
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(350);
    });

    it('deve calcular total com desconto', () => {
      const result = calcularTotalVenda([item1, item2], 50);
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(300);
    });

    it('deve retornar total zero quando desconto é igual ao subtotal', () => {
      const result = calcularTotalVenda([item1, item2], 350);
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(0);
    });

    it('deve retornar total zero quando desconto é maior que subtotal', () => {
      const result = calcularTotalVenda([item1, item2], 500);
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(0);
    });

    it('deve calcular corretamente com um único item', () => {
      const result = calcularTotalVenda([item1], 0);
      expect(result.subtotal).toBe(200);
      expect(result.total).toBe(200);
    });

    it('deve calcular corretamente com desconto em um único item', () => {
      const result = calcularTotalVenda([item1], 50);
      expect(result.subtotal).toBe(200);
      expect(result.total).toBe(150);
    });

    it('deve calcular corretamente com muitos itens', () => {
      const items: ItemVendaEntity[] = [
        { ...item1 },
        { ...item2 },
        { ...item1, produto_id: 3 },
        { ...item2, produto_id: 4 },
      ];
      const result = calcularTotalVenda(items, 100);
      expect(result.subtotal).toBe(700); // 200 + 150 + 200 + 150
      expect(result.total).toBe(600);
    });

    it('deve calcular com desconto em percentual (exemplo: 10%)', () => {
      const subtotal = 350;
      const desconto = subtotal * 0.1; // 35
      const result = calcularTotalVenda([item1, item2], desconto);
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(315);
    });

    it('deve retornar sempre >= 0 para total', () => {
      const result = calcularTotalVenda([item1], 1000);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('deve manter precisão com valores decimais', () => {
      const itemDecimal: ItemVendaEntity = {
        produto_id: 1,
        produto_nome: 'Produto',
        produto_codigo: 'COD-A',
        quantidade: 1,
        preco_unitario: 99.99,
        subtotal: 99.99,
      };
      const result = calcularTotalVenda([itemDecimal], 10);
      expect(result.subtotal).toBe(99.99);
      expect(result.total).toBeCloseTo(89.99, 2);
    });

    it('deve calcular com lista vazia retornando zero', () => {
      const result = calcularTotalVenda([], 0);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });

    it('deve calcular correctamente desconto parcial', () => {
      const result = calcularTotalVenda([item1, item2], 175); // 50% de desconto
      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(175);
    });
  });
});
