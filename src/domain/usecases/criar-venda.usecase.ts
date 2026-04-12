import type { ItemVendaEntity } from "@/domain/entities/item-venda";
import type { ProdutoVendaBuscaEntity } from "@/domain/entities/venda";
import { validarEstoqueDisponivel } from "@/domain/rules/validar-estoque-disponivel";
import { calcularTotalVenda } from "@/domain/rules/calcular-total-venda";
import { 
  OperacaoNaoPermitidaError,
  DadosInvalidosError,
  EstoqueInsuficienteError,
} from "@/domain/errors/domain-error";

/**
 * Input DTO para criar uma venda
 * Tipagem forte para evitar erros
 */
export type CriarVendaInput = {
  cliente_id: number;
  itens: Array<{
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
  }>;
  forma_pagamento: 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'CHEQUE' | 'PIX';
  desconto_total?: number;
  observacoes?: string;
};

/**
 * Output DTO para resposta da venda criada
 */
export type CriarVendaOutput = {
  venda_id: number;
  total: number;
  itens_quantidade: number;
};

/**
 * Use Case: Criar Uma Venda Com Validações de Negócio
 * 
 * Responsabilidades:
 * 1. Validar entrada (items, cliente, formas de pagamento)
 * 2. Aplicar regras de estoque
 * 3. Calcular total com descontos
 * 4. Orquestrar persistência
 * 
 * Exemplo de padrão SOLID:
 * - Single Responsibility: Apenas criar venda
 * - Open/Closed: Fácil adicionar novas regras (validadores)
 * - Dependency Inversion: Depende de abstrações (repositories, rules)
 */
export class CriarVendaUseCase {
  constructor(
    private vendaRepository: any, // VendaRepository
    private clienteRepository: any, // ClienteRepository
    private produtoRepository: any, // ProdutoRepository
    private estoqueRepository: any, // EstoqueRepository
  ) {}

  async execute(input: CriarVendaInput): Promise<CriarVendaOutput> {
    // 1. Validar entrada
    this.validarInput(input);

    // 2. Validar cliente existe
    const cliente = await this.clienteRepository.obterPorId(input.cliente_id);
    if (!cliente) {
      throw new OperacaoNaoPermitidaError('Cliente não encontrado');
    }

    // 3. Validar itens e estoque
    const itensValidados = await this.validarItensEstoque(input.itens);

    // 4. Calcular total (com regra de negócio)
    const resultado = calcularTotalVenda(itensValidados, input.desconto_total || 0);

    // 5. Validar forma de pagamento
    this.validarFormaPagamento(input.forma_pagamento, resultado.total);

    // 6. Persistir venda (transação com estoque)
    const venda_id = await this.vendaRepository.criar({
      cliente_id: input.cliente_id,
      itens: itensValidados,
      total: resultado.total,
      forma_pagamento: input.forma_pagamento,
      desconto_total: input.desconto_total || 0,
      observacoes: input.observacoes,
      data_venda: new Date().toISOString(),
    });

    // 7. Decrmentar estoque para cada item
    for (const item of itensValidados) {
      await this.estoqueRepository.decrementar(
        item.produto_id,
        item.quantidade,
        `VENDA_${venda_id}`
      );
    }

    return {
      venda_id,
      total: resultado.total,
      itens_quantidade: itensValidados.length,
    };
  }

  /**
   * Valida os dados de entrada
   */
  private validarInput(input: CriarVendaInput): void {
    if (!input.itens || input.itens.length === 0) {
      throw new DadosInvalidosError('itens', 'Venda deve ter pelo menos um item');
    }

    if (input.desconto_total && input.desconto_total < 0) {
      throw new DadosInvalidosError('desconto', 'Desconto não pode ser negativo');
    }
  }

  /**
   * Valida itens e estoque disponível
   */
  private async validarItensEstoque(
    itens: CriarVendaInput['itens']
  ): Promise<ItemVendaEntity[]> {
    const itensValidados: ItemVendaEntity[] = [];

    for (const item of itens) {
      // Obter produto
      const produto = await this.produtoRepository.obterPorId(item.produto_id);
      if (!produto) {
        throw new DadosInvalidosError(
          `item_${item.produto_id}`,
          'Produto não encontrado'
        );
      }

      // Validar estoque disponível (regra de negócio em domain/rules)
      const produtoVenda: ProdutoVendaBuscaEntity = {
        id: produto.id,
        codigo: produto.codigo,
        codigo_barras: produto.codigo_barras,
        nome: produto.nome,
        preco_venda: produto.preco_venda,
        estoque_atual: produto.estoque_atual,
        ativo: produto.ativo,
      };

      const temEstoque = validarEstoqueDisponivel(produtoVenda, item.quantidade);
      if (!temEstoque) {
        throw new EstoqueInsuficienteError(
          produto.nome,
          item.quantidade,
          produtoVenda.estoque_atual
        );
      }

      itensValidados.push({
        produto_id: item.produto_id,
        produto_nome: produto.nome,
        produto_codigo: produto.codigo,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.quantidade * item.preco_unitario,
      });
    }

    return itensValidados;
  }

  /**
   * Valida forma de pagamento
   * Ex: Cheques podem ter restrições, transferências requerem dados bancários
   */
  private validarFormaPagamento(forma: string, total: number): void {
    if (!['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'CHEQUE', 'PIX'].includes(forma)) {
      throw new DadosInvalidosError('forma_pagamento', 'Forma de pagamento inválida');
    }

    // Regra: Vendas muito altas em dinheiro podem ser suspeitas
    if (forma === 'DINHEIRO' && total > 5000) {
      console.warn(`⚠️ Venda em dinheiro acima de R$ 5000: ${total}`);
    }
  }
}

/**
 * Factory para criar o use case com dependências injetadas
 * Padrão de injeção de dependência
 */
export function criarVendaUseCaseFactory() {
  // Aqui injetaríamos os repositories da aplicação
  // No mundo real, viria de um container DI (ex: InversifyJS, Awilix)
  
  // Por enquanto, exemplo simplificado:
  return new CriarVendaUseCase(
    {} as any, // vendaRepository
    {} as any, // clienteRepository
    {} as any, // produtoRepository
    {} as any, // estoqueRepository
  );
}
