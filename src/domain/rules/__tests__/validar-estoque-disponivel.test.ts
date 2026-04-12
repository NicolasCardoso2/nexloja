import { describe, it, expect } from 'vitest';
import { validarEstoqueDisponivel } from '../validar-estoque-disponivel';
import type { ProdutoVendaBuscaEntity } from '@/domain/entities/venda';

describe('validar-estoque-disponivel', () => {
  describe('validarEstoqueDisponivel', () => {
    const produtoComEstoque: ProdutoVendaBuscaEntity = {
      id: 1,
      codigo: 'PROD-001',
      nome: 'Produto A',
      preco_venda: 100,
      estoque_atual: 10,
      ativo: true,
    };

    const produtoSemEstoque: ProdutoVendaBuscaEntity = {
      id: 2,
      codigo: 'PROD-002',
      nome: 'Produto B',
      preco_venda: 50,
      estoque_atual: 0,
      ativo: true,
    };

    it('deve permitir venda com estoque suficiente', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, 5);
      expect(result).toBe(true);
    });

    it('deve permitir venda com quantidade igual ao estoque', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, 10);
      expect(result).toBe(true);
    });

    it('deve bloquear venda com estoque insuficiente', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, 11);
      expect(result).toBe(false);
    });

    it('deve bloquear venda com quantidade zero', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, 0);
      expect(result).toBe(false);
    });

    it('deve bloquear venda com quantidade negativa', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, -5);
      expect(result).toBe(false);
    });

    it('deve bloquear venda de produto sem estoque', () => {
      const result = validarEstoqueDisponivel(produtoSemEstoque, 1);
      expect(result).toBe(false);
    });

    it('deve bloquear venda de produto com estoque zerado', () => {
      const result = validarEstoqueDisponivel(produtoSemEstoque, 0);
      expect(result).toBe(false);
    });

    it('deve permitir venda de 1 unidade com estoque > 1', () => {
      const result = validarEstoqueDisponivel(produtoComEstoque, 1);
      expect(result).toBe(true);
    });

    it('deve permitir venda de quantidade muito alta quando há estoque', () => {
      const produtoComMuitoEstoque: ProdutoVendaBuscaEntity = {
        ...produtoComEstoque,
        estoque_atual: 1000,
      };
      const result = validarEstoqueDisponivel(produtoComMuitoEstoque, 999);
      expect(result).toBe(true);
    });

    it('deve bloquear venda acima do estoque mesmo que muito alta', () => {
      const produtoComMuitoEstoque: ProdutoVendaBuscaEntity = {
        ...produtoComEstoque,
        estoque_atual: 1000,
      };
      const result = validarEstoqueDisponivel(produtoComMuitoEstoque, 1001);
      expect(result).toBe(false);
    });
  });
});
