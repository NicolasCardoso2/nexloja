import { describe, it, expect } from 'vitest';
import {
  DomainError,
  EstoqueInsuficienteError,
  RecursoNaoEncontradoError,
  OperacaoNaoPermitidaError,
  DadosInvalidosError,
  ErroServidorError,
  isDomainError,
  mapApiErrorToDomainError,
} from '../domain-error';

describe('domain-error', () => {
  describe('DomainError', () => {
    it('deve criar erro com código e mensagem', () => {
      const error = new DomainError('TEST_ERROR', 'Mensagem de teste');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Mensagem de teste');
    });

    it('deve ter status code padrão 400', () => {
      const error = new DomainError('TEST_ERROR', 'Mensagem de teste');

      expect(error.statusCode).toBe(400);
    });

    it('deve permitir status code custom', () => {
      const error = new DomainError('TEST_ERROR', 'Mensagem de teste', 500);

      expect(error.statusCode).toBe(500);
    });
  });

  describe('EstoqueInsuficienteError', () => {
    it('deve criar erro com detalhes de estoque', () => {
      const error = new EstoqueInsuficienteError('Camiseta Azul', 5, 2);

      expect(error.code).toBe('ESTOQUE_INSUFICIENTE');
      expect(error.message).toContain('Camiseta Azul');
      expect(error.statusCode).toBe(409);
    });

    it('deve incluir quantidades no erro', () => {
      const error = new EstoqueInsuficienteError('Produto', 10, 3);

      expect(error.message).toContain('10');
      expect(error.message).toContain('3');
    });
  });

  describe('RecursoNaoEncontradoError', () => {
    it('deve criar erro com tipo e ID', () => {
      const error = new RecursoNaoEncontradoError('Cliente', 123);

      expect(error.code).toBe('RECURSO_NAO_ENCONTRADO');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('Cliente');
      expect(error.message).toContain('123');
    });
  });

  describe('OperacaoNaoPermitidaError', () => {
    it('deve criar erro de operação não permitida', () => {
      const error = new OperacaoNaoPermitidaError('Não é possível cancelar esta venda');

      expect(error.code).toBe('OPERACAO_NAO_PERMITIDA');
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('Não é possível cancelar');
    });
  });

  describe('DadosInvalidosError', () => {
    it('deve criar erro com campo e mensagem', () => {
      const error = new DadosInvalidosError('email', 'Email inválido');

      expect(error.code).toBe('DADOS_INVALIDOS');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('email');
      expect(error.message).toContain('Email inválido');
    });
  });

  describe('ErroServidorError', () => {
    it('deve criar erro com mensagem padrão', () => {
      const error = new ErroServidorError();

      expect(error.code).toBe('ERRO_SERVIDOR');
      expect(error.statusCode).toBe(500);
      expect(error.message).toContain('servidor');
    });

    it('deve aceitar mensagem customizada', () => {
      const error = new ErroServidorError('Database connection failed');

      expect(error.message).toContain('Database connection failed');
    });
  });

  describe('isDomainError', () => {
    it('deve retornar true para DomainError', () => {
      const error = new DomainError('TEST', 'teste');

      expect(isDomainError(error)).toBe(true);
    });

    it('deve retornar true para subclasses', () => {
      const error = new EstoqueInsuficienteError('Produto', 5, 2);

      expect(isDomainError(error)).toBe(true);
    });

    it('deve retornar false para erros padrão', () => {
      const error = new Error('Erro padrão');

      expect(isDomainError(error)).toBe(false);
    });

    it('deve retornar false para null', () => {
      expect(isDomainError(null)).toBe(false);
    });

    it('deve retornar false para undefined', () => {
      expect(isDomainError(undefined)).toBe(false);
    });
  });

  describe('mapApiErrorToDomainError', () => {
    it('deve retornar DomainError se já é DomainError', () => {
      const domainError = new DomainError('TEST', 'teste');

      const result = mapApiErrorToDomainError(domainError);

      expect(result).toEqual(domainError);
    });

    it('deve mapear erro 404 para RecursoNaoEncontradoError', () => {
      const apiError = {
        response: { status: 404 },
      };

      const result = mapApiErrorToDomainError(apiError);

      expect(result).toBeInstanceOf(RecursoNaoEncontradoError);
      expect(result.code).toBe('RECURSO_NAO_ENCONTRADO');
    });

    it('deve mapear erro 409 para EstoqueInsuficienteError', () => {
      const apiError = {
        response: {
          status: 409,
          data: { produto: 'Camiseta', solicitado: 5, disponivel: 2 },
        },
      };

      const result = mapApiErrorToDomainError(apiError);

      expect(result).toBeInstanceOf(EstoqueInsuficienteError);
    });

    it('deve mapear erro 403 para OperacaoNaoPermitidaError', () => {
      const apiError = {
        response: {
          status: 403,
          data: { message: 'Não permitido' },
        },
      };

      const result = mapApiErrorToDomainError(apiError);

      expect(result).toBeInstanceOf(OperacaoNaoPermitidaError);
    });

    it('deve mapear erro 500+ para ErroServidorError', () => {
      const apiError = {
        response: { status: 500 },
      };

      const result = mapApiErrorToDomainError(apiError);

      expect(result).toBeInstanceOf(ErroServidorError);
    });

    it('deve usar mensagem customizada do erro 500', () => {
      const apiError = {
        response: {
          status: 500,
          data: { message: 'Database error' },
        },
      };

      const result = mapApiErrorToDomainError(apiError);

      expect(result.message).toContain('Database error');
    });

    it('deve mapear erro desconhecido para ErroServidorError', () => {
      const apiError = new Error('Erro desconhecido');

      const result = mapApiErrorToDomainError(apiError);

      expect(result).toBeInstanceOf(ErroServidorError);
    });

    it('deve usar mensagem do erro genérico', () => {
      const apiError = new Error('Erro customizado');

      const result = mapApiErrorToDomainError(apiError);

      expect(result.message).toContain('Erro customizado');
    });
  });
});
