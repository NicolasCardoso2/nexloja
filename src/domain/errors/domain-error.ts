/**
 * Classe base para erros de domínio
 * Todos os erros de negócio devem herdar dessa classe
 */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Erro quando estoque é insuficiente para uma operação
 */
export class EstoqueInsuficienteError extends DomainError {
  constructor(produtoNome: string, solicitado: number, disponivel: number) {
    super(
      'ESTOQUE_INSUFICIENTE',
      `Estoque insuficiente para ${produtoNome}. Solicitado: ${solicitado}, Disponível: ${disponivel}`,
      409 // Conflict
    );
    Object.setPrototypeOf(this, EstoqueInsuficienteError.prototype);
  }
}

/**
 * Erro quando um recurso não é encontrado
 */
export class RecursoNaoEncontradoError extends DomainError {
  constructor(tipo: string, id: number | string) {
    super(
      'RECURSO_NAO_ENCONTRADO',
      `${tipo} com ID ${id} não encontrado`,
      404
    );
    Object.setPrototypeOf(this, RecursoNaoEncontradoError.prototype);
  }
}

/**
 * Erro quando operação não é permitida (ex: cancelar venda já fechada)
 */
export class OperacaoNaoPermitidaError extends DomainError {
  constructor(mensagem: string) {
    super(
      'OPERACAO_NAO_PERMITIDA',
      mensagem,
      403 // Forbidden
    );
    Object.setPrototypeOf(this, OperacaoNaoPermitidaError.prototype);
  }
}

/**
 * Erro quando dados enviados são inválidos
 */
export class DadosInvalidosError extends DomainError {
  constructor(campo: string, mensagem: string) {
    super(
      'DADOS_INVALIDOS',
      `Campo [${campo}]: ${mensagem}`,
      400
    );
    Object.setPrototypeOf(this, DadosInvalidosError.prototype);
  }
}

/**
 * Erro genérico de API/servidor
 */
export class ErroServidorError extends DomainError {
  constructor(mensagem: string = 'Erro ao se comunicar com o servidor') {
    super(
      'ERRO_SERVIDOR',
      mensagem,
      500
    );
    Object.setPrototypeOf(this, ErroServidorError.prototype);
  }
}

/**
 * Tipo guard para verificar se é um DomainError
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Mapper para converter erros de API em DomainErrors
 */
export function mapApiErrorToDomainError(error: any): DomainError {
  // Se já é um DomainError, retorna direto
  if (isDomainError(error)) {
    return error;
  }

  // Se tem response de erro HTTP
  if (error?.response?.status === 404) {
    return new RecursoNaoEncontradoError('Recurso', 'desconhecido');
  }

  if (error?.response?.status === 409) {
    return new EstoqueInsuficienteError(
      error?.response?.data?.produto || 'Produto',
      error?.response?.data?.solicitado || 0,
      error?.response?.data?.disponivel || 0
    );
  }

  if (error?.response?.status === 403) {
    return new OperacaoNaoPermitidaError(
      error?.response?.data?.message || 'Operação não permitida'
    );
  }

  if (error?.response?.status >= 500) {
    return new ErroServidorError(
      error?.response?.data?.message || 'Erro no servidor'
    );
  }

  // Erro genérico desconhecido
  return new ErroServidorError(
    error?.message || 'Erro desconhecido ao processar requisição'
  );
}
