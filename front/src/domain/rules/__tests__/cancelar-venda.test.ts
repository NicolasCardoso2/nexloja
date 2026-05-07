import { describe, it, expect } from 'vitest';
import { cancelarVenda } from '../cancelar-venda';
import type { VendaDetalheEntity } from '@/domain/entities/venda';

describe('cancelar-venda', () => {
  describe('cancelarVenda', () => {
    it('deve permitir cancelamento de venda finalizada', () => {
      const venda: VendaDetalheEntity = {
        id: 1,
        numero_venda: 'VND-001',
        criado_em: '2024-01-01T10:00:00Z',
        usuario_id: 1,
        usuario_nome: 'João',
        caixa_sessao_id: 1,
        forma_pagamento: 'DINHEIRO',
        subtotal: 100,
        desconto: 0,
        total: 100,
        status: 'FINALIZADA',
        itens: [],
      };

      const result = cancelarVenda(venda);

      expect(result.podeCancelar).toBe(true);
      expect(result.motivo).toBeUndefined();
    });

    it('deve bloquear cancelamento de venda já cancelada', () => {
      const venda: VendaDetalheEntity = {
        id: 1,
        numero_venda: 'VND-001',
        criado_em: '2024-01-01T10:00:00Z',
        usuario_id: 1,
        usuario_nome: 'João',
        caixa_sessao_id: 1,
        forma_pagamento: 'DINHEIRO',
        subtotal: 100,
        desconto: 0,
        total: 100,
        status: 'CANCELADA',
        cancelado_em: '2024-01-01T10:30:00Z',
        itens: [],
      };

      const result = cancelarVenda(venda);

      expect(result.podeCancelar).toBe(false);
      expect(result.motivo).toBeDefined();
    });

    it('deve fornecer motivo quando venda já foi cancelada', () => {
      const venda: VendaDetalheEntity = {
        id: 1,
        numero_venda: 'VND-001',
        criado_em: '2024-01-01T10:00:00Z',
        usuario_id: 1,
        usuario_nome: 'João',
        caixa_sessao_id: 1,
        forma_pagamento: 'DINHEIRO',
        subtotal: 100,
        desconto: 0,
        total: 100,
        status: 'CANCELADA',
        cancelado_em: '2024-01-01T10:30:00Z',
        itens: [],
      };

      const result = cancelarVenda(venda);

      expect(result.motivo).toContain('cancelada');
    });

    it('deve permitir cancelamento com múltiplos itens', () => {
      const venda: VendaDetalheEntity = {
        id: 1,
        numero_venda: 'VND-001',
        criado_em: '2024-01-01T10:00:00Z',
        usuario_id: 1,
        usuario_nome: 'João',
        caixa_sessao_id: 1,
        forma_pagamento: 'DINHEIRO',
        subtotal: 500,
        desconto: 50,
        total: 450,
        status: 'FINALIZADA',
        itens: [
          {
            produto_id: 1,
            produto_nome: 'Produto A',
            produto_codigo: 'COD-A',
            quantidade: 2,
            preco_unitario: 100,
            subtotal: 200,
          },
          {
            produto_id: 2,
            produto_nome: 'Produto B',
            produto_codigo: 'COD-B',
            quantidade: 3,
            preco_unitario: 100,
            subtotal: 300,
          },
        ],
      };

      const result = cancelarVenda(venda);

      expect(result.podeCancelar).toBe(true);
    });
  });
});
