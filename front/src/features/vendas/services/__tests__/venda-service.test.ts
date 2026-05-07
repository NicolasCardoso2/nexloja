import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVendaService, cancelarVendaService } from '../venda-service';
import { DadosInvalidosError, OperacaoNaoPermitidaError } from '@/domain/errors/domain-error';
import type { FinalizarVendaInput, CancelarVendaInput } from '@/domain/entities/venda';

// Mock dos repositories
vi.mock('@/data/repositories/venda-repository', () => ({
  createVendaRepository: vi.fn(),
  listVendasRepository: vi.fn(),
  getVendaByIdRepository: vi.fn(),
  cancelarVendaRepository: vi.fn(),
  searchProdutosVendaRepository: vi.fn(),
}));

const { createVendaRepository, getVendaByIdRepository, cancelarVendaRepository } = require('@/data/repositories/venda-repository');

describe('venda-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createVendaService', () => {
    const validPayload: FinalizarVendaInput = {
      usuario_id: 1,
      cliente_id: 1,
      desconto: 0,
      forma_pagamento: 'DINHEIRO',
      itens: [
        {
          produto_id: 1,
          quantidade: 2,
        },
      ],
    };

    it('deve criar venda com dados válidos', async () => {
      createVendaRepository.mockResolvedValueOnce(1);

      const result = await createVendaService(validPayload);

      expect(result).toBe(1);
      expect(createVendaRepository).toHaveBeenCalledWith(validPayload);
    });

    it('deve lançar erro se não há itens', async () => {
      const invalidPayload = { ...validPayload, itens: [] };

      await expect(async () => {
        await createVendaService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se itens é undefined', async () => {
      const invalidPayload = { ...validPayload, itens: undefined as any };

      await expect(async () => {
        await createVendaService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se desconto é negativo', async () => {
      const invalidPayload = { ...validPayload, desconto: -100 };

      await expect(async () => {
        await createVendaService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar desconto zero', async () => {
      createVendaRepository.mockResolvedValueOnce(1);

      const result = await createVendaService(validPayload);

      expect(result).toBe(1);
    });

    it('deve aceitar desconto positivo', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, desconto: 50 };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });

    it('deve lançar erro se forma de pagamento é inválida', async () => {
      const invalidPayload = { ...validPayload, forma_pagamento: 'METODO_INVALIDO' as any };

      await expect(async () => {
        await createVendaService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar forma de pagamento DINHEIRO', async () => {
      createVendaRepository.mockResolvedValueOnce(1);

      const result = await createVendaService(validPayload);

      expect(result).toBe(1);
    });

    it('deve aceitar forma de pagamento PIX', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, forma_pagamento: 'PIX' as const };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });

    it('deve aceitar forma de pagamento CARTAO_DEBITO', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, forma_pagamento: 'CARTAO_DEBITO' as const };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });

    it('deve aceitar forma de pagamento CARTAO_CREDITO', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, forma_pagamento: 'CARTAO_CREDITO' as const };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });

    it('deve não chamar repository se validação falhar', async () => {
      const invalidPayload = { ...validPayload, itens: [] };

      try {
        await createVendaService(invalidPayload);
      } catch {
        // expected
      }

      expect(createVendaRepository).not.toHaveBeenCalled();
    });

    it('deve aceitar cliente_id undefined', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, cliente_id: undefined };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });

    it('deve aceitar venda com múltiplos itens', async () => {
      createVendaRepository.mockResolvedValueOnce(1);
      const payload = {
        ...validPayload,
        itens: [
          { produto_id: 1, quantidade: 2 },
          { produto_id: 2, quantidade: 3 },
          { produto_id: 3, quantidade: 1 },
        ],
      };

      const result = await createVendaService(payload);

      expect(result).toBe(1);
    });
  });

  describe('cancelarVendaService', () => {
    const validPayload: CancelarVendaInput = {
      venda_id: 1,
      usuario_id: 1,
    };

    it('deve cancelar venda finalizada', async () => {
      getVendaByIdRepository.mockResolvedValueOnce({
        id: 1,
        status: 'FINALIZADA',
      });
      cancelarVendaRepository.mockResolvedValueOnce(undefined);

      await cancelarVendaService(validPayload);

      expect(cancelarVendaRepository).toHaveBeenCalledWith(validPayload);
    });

    it('deve lançar erro ao tentar cancelar venda já cancelada', async () => {
      getVendaByIdRepository.mockResolvedValueOnce({
        id: 1,
        status: 'CANCELADA',
      });

      await expect(async () => {
        await cancelarVendaService(validPayload);
      }).rejects.toThrow(OperacaoNaoPermitidaError);
    });

    it('deve não chamar repository se venda já está cancelada', async () => {
      getVendaByIdRepository.mockResolvedValueOnce({
        id: 1,
        status: 'CANCELADA',
      });

      try {
        await cancelarVendaService(validPayload);
      } catch {
        // expected
      }

      expect(cancelarVendaRepository).not.toHaveBeenCalled();
    });

    it('deve buscar venda antes de cancelar', async () => {
      getVendaByIdRepository.mockResolvedValueOnce({
        id: 1,
        status: 'FINALIZADA',
      });
      cancelarVendaRepository.mockResolvedValueOnce(undefined);

      await cancelarVendaService(validPayload);

      expect(getVendaByIdRepository).toHaveBeenCalledWith(1);
    });

    it('deve rejeitar cancelamento de venda já cancelada com mensagem clara', async () => {
      getVendaByIdRepository.mockResolvedValueOnce({
        id: 1,
        status: 'CANCELADA',
      });

      try {
        await cancelarVendaService(validPayload);
        throw new Error('Deveria ter lançado erro');
      } catch (error) {
        expect(error).toBeInstanceOf(OperacaoNaoPermitidaError);
      }
    });
  });
});
