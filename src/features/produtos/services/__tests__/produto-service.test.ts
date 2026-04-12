import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProdutoService } from '../produto-service';
import { DadosInvalidosError } from '@/domain/errors/domain-error';
import type { UpsertProdutoInput } from '@/domain/entities/produto';

// Mock do repository
vi.mock('@/data/repositories/produto-repository', () => ({
  createProdutoRepository: vi.fn(),
  listProdutosRepository: vi.fn(),
  getProdutoByIdRepository: vi.fn(),
  updateProdutoRepository: vi.fn(),
}));

const { createProdutoRepository } = require('@/data/repositories/produto-repository');

describe('produto-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProdutoService', () => {
    const validPayload: UpsertProdutoInput = {
      codigo: 'PROD-001',
      nome: 'Novo Produto',
      categoria_id: 1,
      preco_venda: 100,
      estoque_atual: 10,
      estoque_minimo: 5,
      ativo: true,
    };

    it('deve criar produto com dados válidos', async () => {
      createProdutoRepository.mockResolvedValueOnce(123);

      const result = await createProdutoService(validPayload);

      expect(result).toBe(123);
      expect(createProdutoRepository).toHaveBeenCalledWith(validPayload);
    });

    it('deve lançar erro se nome está vazio', async () => {
      const invalidPayload = { ...validPayload, nome: '' };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se nome é apenas espaços', async () => {
      const invalidPayload = { ...validPayload, nome: '   ' };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se nome não é fornecido', async () => {
      const invalidPayload = { ...validPayload, nome: undefined as any };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se código está vazio', async () => {
      const invalidPayload = { ...validPayload, codigo: '' };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se preço é negativo', async () => {
      const invalidPayload = { ...validPayload, preco_venda: -100 };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se preço de custo é negativo', async () => {
      const invalidPayload = { ...validPayload, preco_custo: -50 };

      await expect(async () => {
        await createProdutoService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar preço zero', async () => {
      const payload = { ...validPayload, preco_venda: 0 };
      createProdutoRepository.mockResolvedValueOnce(123);

      const result = await createProdutoService(payload);

      expect(result).toBe(123);
    });

    it('deve aceitar preço de custo undefined', async () => {
      const payload = { ...validPayload, preco_custo: undefined };
      createProdutoRepository.mockResolvedValueOnce(123);

      const result = await createProdutoService(payload);

      expect(result).toBe(123);
    });

    it('deve não chamar repository se validação falhar', async () => {
      const invalidPayload = { ...validPayload, preco_venda: -100 };

      try {
        await createProdutoService(invalidPayload);
      } catch {
        // expected
      }

      expect(createProdutoRepository).not.toHaveBeenCalled();
    });

    it('deve validar preço antes de persistir', async () => {
      const payload = { ...validPayload, preco_venda: 100 };
      createProdutoRepository.mockResolvedValueOnce(123);

      await createProdutoService(payload);

      expect(createProdutoRepository).toHaveBeenCalled();
    });
  });
});
