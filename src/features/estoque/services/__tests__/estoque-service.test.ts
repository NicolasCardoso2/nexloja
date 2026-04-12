import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrarMovimentacaoEstoqueService } from '../estoque-service';
import { DadosInvalidosError } from '@/domain/errors/domain-error';
import type { RegistrarMovimentacaoInput } from '@/domain/entities/movimentacao-estoque';

// Mock do repository
vi.mock('@/data/repositories/estoque-repository', () => ({
  listEstoqueRepository: vi.fn(),
  listMovimentacoesEstoqueRepository: vi.fn(),
  listProdutosMovimentacaoRepository: vi.fn(),
  registrarMovimentacaoEstoqueRepository: vi.fn(),
}));

const { registrarMovimentacaoEstoqueRepository } = require('@/data/repositories/estoque-repository');

describe('estoque-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrarMovimentacaoEstoqueService', () => {
    const validPayload: RegistrarMovimentacaoInput = {
      produto_id: 1,
      usuario_id: 1,
      tipo: 'ENTRADA',
      quantidade: 10,
      motivo: 'Reposição de estoque',
      observacao: 'Reposição automática',
    };

    it('deve registrar movimentação com dados válidos', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);

      await registrarMovimentacaoEstoqueService(validPayload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalledWith(validPayload);
    });

    it('deve lançar erro se produto_id é inválido', async () => {
      const invalidPayload = { ...validPayload, produto_id: 0 };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se produto_id é negativo', async () => {
      const invalidPayload = { ...validPayload, produto_id: -1 };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se tipo é inválido', async () => {
      const invalidPayload = { ...validPayload, tipo: 'INVALIDO' as any };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar tipo ENTRADA', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);
      const payload = { ...validPayload, tipo: 'ENTRADA' as const };

      await registrarMovimentacaoEstoqueService(payload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });

    it('deve aceitar tipo SAIDA', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);
      const payload = { ...validPayload, tipo: 'SAIDA' as const };

      await registrarMovimentacaoEstoqueService(payload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });

    it('deve aceitar tipo AJUSTE', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);
      const payload = { ...validPayload, tipo: 'AJUSTE' as const };

      await registrarMovimentacaoEstoqueService(payload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });

    it('deve lançar erro se quantidade é zero', async () => {
      const invalidPayload = { ...validPayload, quantidade: 0 };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se quantidade é negativa', async () => {
      const invalidPayload = { ...validPayload, quantidade: -5 };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar quantidade positiva', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);

      await registrarMovimentacaoEstoqueService(validPayload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });

    it('deve lançar erro se observação está vazia', async () => {
      const invalidPayload = { ...validPayload, observacao: '' };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se observação é apenas espaços', async () => {
      const invalidPayload = { ...validPayload, observacao: '   ' };

      await expect(async () => {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve não chamar repository se validação falhar', async () => {
      const invalidPayload = { ...validPayload, quantidade: 0 };

      try {
        await registrarMovimentacaoEstoqueService(invalidPayload);
      } catch {
        // expected
      }

      expect(registrarMovimentacaoEstoqueRepository).not.toHaveBeenCalled();
    });

    it('deve aceitar quantidade decimal (fracionária)', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);
      const payload = { ...validPayload, quantidade: 2.5 };

      await registrarMovimentacaoEstoqueService(payload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });

    it('deve aceitar quantidade muito grande', async () => {
      registrarMovimentacaoEstoqueRepository.mockResolvedValueOnce(undefined);
      const payload = { ...validPayload, quantidade: 999999999 };

      await registrarMovimentacaoEstoqueService(payload);

      expect(registrarMovimentacaoEstoqueRepository).toHaveBeenCalled();
    });
  });
});
