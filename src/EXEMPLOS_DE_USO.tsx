import { useState } from 'react';
import type { UpsertProdutoInput } from '@/domain/entities/produto';
import { useListProdutos, useCreateProduto, useUpdateProduto } from '@/features/produtos/hooks/useProduto';
// import { isDomainError } from '@/domain';

/**
 * EXEMPLO 1: Listar Produtos
 */
export function ExemploListarProdutos() {
  const { data: produtos, isLoading, error } = useListProdutos();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <ul>
      {produtos?.map(p => (
        <li key={p.id}>{p.nome} - R$ {p.preco_venda}</li>
      ))}
    </ul>
  );
}

/**
 * EXEMPLO 2: Criar Produto com Tratamento de Erros
 */
export function ExemploCriarProduto() {
  // const { mutate: criar, isPending, error } = useCreateProduto();
  const { mutate: _criar, isPending, error } = useCreateProduto();
  const [showForm, setShowForm] = useState(false);

  // Exemplo de como submeter o formulário:
  // criar(formData, {
  //   onSuccess: (id) => { ... },
  //   onError: (error) => { ... }
  // });

  return (
    <div>
      {!showForm && <button onClick={() => setShowForm(true)}>+ Novo Produto</button>}
      {showForm && (
        <form onSubmit={(e) => {
          e.preventDefault();
          // Capturar dados do formulário e chamar criar()
        }}>
          <input placeholder="Nome" required />
          <input placeholder="Preço" type="number" required />
          <button disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
          {error && <span style={{ color: 'red' }}>{error.message}</span>}
        </form>
      )}
    </div>
  );
}

/**
 * EXEMPLO 3: Tabela com Listar + Criar
 */
export function ExemploTabelaProdutos() {
  const { data: produtos, isLoading } = useListProdutos();
  const { mutate: criar } = useCreateProduto();

  const handleNovoClick = () => {
    const input: UpsertProdutoInput = {
      codigo: 'TEST-001',
      nome: 'Novo Produto',
      categoria_id: 1,
      preco_venda: 100,
      estoque_atual: 10,
      estoque_minimo: 5,
      ativo: true,
    };
    criar(input);
  };

  return (
    <div>
      <button onClick={handleNovoClick}>Adicionar Produto</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={4}>Carregando...</td></tr>
          ) : (
            produtos?.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>R$ {p.preco_venda.toFixed(2)}</td>
                <td>{p.estoque_atual}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * EXEMPLO 4: Editar Produto
 */
export function ExemploEditarProduto({ produtoId: _produtoId }: { produtoId: number }) {
  // const { mutate: atualizar, isPending, error } = useUpdateProduto();
  const { mutate: _atualizar, isPending, error } = useUpdateProduto();

  // Exemplo de como atualizar o produto:
  // atualizar(
  //   { id: produtoId, payload: formData },
  //   {
  //     onSuccess: () => { ... },
  //     onError: (error) => { ... }
  //   }
  // );

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        // Capturar dados do formulário e chamar atualizar()
      }}>
        <input type="text" placeholder="Nome" />
        <input type="number" placeholder="Preço" />
        <button disabled={isPending}>
          {isPending ? 'Salvando...' : 'Atualizar'}
        </button>
        {error && <p style={{ color: 'red' }}>{error.message}</p>}
      </form>
    </div>
  );
}

/**
 * EXEMPLO 5: Use Case - Criar Venda Complexa
 * (Para usar quando a lógica fica muito complexa)
 */

// import { CriarVendaUseCase, type CriarVendaInput } from '@/domain';
// Teórico: injeção de dependência
// const criarVendaUseCase = container.resolve(CriarVendaUseCase);

export async function exemploUsarUseCase() {
  // const useCase = new CriarVendaUseCase(
  //   vendaRepo, clienteRepo, produtoRepo, estoqueRepo
  // );

  // try {
  //   const resultado = await useCase.execute({
  //     cliente_id: 1,
  //     itens: [
  //       { produto_id: 1, quantidade: 2, preco_unitario: 100 }
  //     ],
  //     forma_pagamento: 'PIX',
  //   });
  //   console.log(`Venda criada: ${resultado.venda_id}`);
  // } catch (error) {
  //   if (isDomainError(error)) {
  //     console.error(`Erro de negócio: ${error.code}`);
  //   }
  // }
}
