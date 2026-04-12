import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClienteService, updateClienteService } from '../cliente-service';
import { DadosInvalidosError } from '@/domain/errors/domain-error';
import type { UpsertClienteInput } from '@/domain/entities/cliente';

// Mock do repository
vi.mock('@/data/repositories/cliente-repository', () => ({
  createClienteRepository: vi.fn(),
  listClientesRepository: vi.fn(),
  getClienteByIdRepository: vi.fn(),
  updateClienteRepository: vi.fn(),
}));

const { createClienteRepository, updateClienteRepository: updateClienteRepositoryMock } = require('@/data/repositories/cliente-repository');

describe('cliente-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClienteService', () => {
    const validPayload: UpsertClienteInput = {
      nome: 'João Silva',
      cpf: '12345678901',
      email: 'joao@example.com',
      telefone: '1198765432',
      endereco: 'Rua A, 123',
      ativo: true,
    };

    it('deve criar cliente com dados válidos', async () => {
      createClienteRepository.mockResolvedValueOnce(1);

      const result = await createClienteService(validPayload);

      expect(result).toBe(1);
      expect(createClienteRepository).toHaveBeenCalledWith(validPayload);
    });

    it('deve lançar erro se nome está vazio', async () => {
      const invalidPayload = { ...validPayload, nome: '' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve lançar erro se nome é apenas espaços', async () => {
      const invalidPayload = { ...validPayload, nome: '   ' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve validar CPF quando fornecido', async () => {
      const invalidPayload = { ...validPayload, cpf: '123' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar CPF válido com 11 dígitos', async () => {
      createClienteRepository.mockResolvedValueOnce(1);

      const result = await createClienteService(validPayload);

      expect(result).toBe(1);
    });

    it('deve lançar erro para email inválido', async () => {
      const invalidPayload = { ...validPayload, email: 'email-invalido' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve aceitar email válido', async () => {
      createClienteRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, email: 'valid@example.com' };

      const result = await createClienteService(payload);

      expect(result).toBe(1);
    });

    it('deve aceitar cliente sem CPF', async () => {
      createClienteRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, cpf: undefined };

      const result = await createClienteService(payload);

      expect(result).toBe(1);
    });

    it('deve aceitar cliente sem email', async () => {
      createClienteRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, email: undefined };

      const result = await createClienteService(payload);

      expect(result).toBe(1);
    });

    it('deve rejeitar email sem @ symbol', async () => {
      const invalidPayload = { ...validPayload, email: 'joaoexample.com' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve rejeitar email sem domínio', async () => {
      const invalidPayload = { ...validPayload, email: 'joao@' };

      await expect(async () => {
        await createClienteService(invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve não chamar repository se validação falhar', async () => {
      const invalidPayload = { ...validPayload, nome: '' };

      try {
        await createClienteService(invalidPayload);
      } catch {
        // expected
      }

      expect(createClienteRepository).not.toHaveBeenCalled();
    });

    it('deve aceitar CPF com formatação (mascara)', async () => {
      createClienteRepository.mockResolvedValueOnce(1);
      const payload = { ...validPayload, cpf: '123.456.789-01' };

      const result = await createClienteService(payload);

      expect(result).toBe(1);
    });
  });

  describe('updateClienteService', () => {
    const validPayload: UpsertClienteInput = {
      nome: 'João Silva Atualizado',
      cpf: '12345678901',
      email: 'joao.novo@example.com',
      telefone: '1198765432',
      endereco: 'Rua B, 456',
      ativo: true,
    };

    it('deve atualizar cliente com dados válidos', async () => {
      updateClienteRepositoryMock.mockResolvedValueOnce(undefined);

      await updateClienteService(1, validPayload);

      expect(updateClienteRepositoryMock).toHaveBeenCalledWith(1, validPayload);
    });

    it('deve lançar erro se nome está vazio na atualização', async () => {
      const invalidPayload = { ...validPayload, nome: '' };

      await expect(async () => {
        await updateClienteService(1, invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve validar email na atualização', async () => {
      const invalidPayload = { ...validPayload, email: 'invalid-email' };

      await expect(async () => {
        await updateClienteService(1, invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });

    it('deve validar CPF na atualização', async () => {
      const invalidPayload = { ...validPayload, cpf: '123' };

      await expect(async () => {
        await updateClienteService(1, invalidPayload);
      }).rejects.toThrow(DadosInvalidosError);
    });
  });
});
