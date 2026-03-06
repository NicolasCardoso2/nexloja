import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { useVendaCartStore } from "@/app/store/venda-cart-store";
import { listClientesService } from "@/features/clientes/services/cliente-service";
import { caixaQueryKeys } from "@/features/caixa/services/caixa-query-keys";
import { getCaixaAtualService } from "@/features/caixa/services/caixa-service";
import { CarrinhoItensTable } from "@/features/vendas/components/carrinho-itens-table";
import { ProdutosBuscaLista } from "@/features/vendas/components/produtos-busca-lista";
import { VendaResumoCard } from "@/features/vendas/components/venda-resumo-card";
import { vendaQueryKeys } from "@/features/vendas/services/venda-query-keys";
import { createVendaService, searchProdutosVendaService } from "@/features/vendas/services/venda-service";
import { FinalizarVendaFormValues, finalizarVendaSchema } from "@/features/vendas/validators/finalizar-venda-schema";
import { calcularTotalVenda } from "@/domain/rules/calcular-total-venda";
import { validarEstoqueDisponivel } from "@/domain/rules/validar-estoque-disponivel";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

export function NovaVendaPage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);
  const { itens, adicionarItem, alterarQuantidade, removerItem, limpar } = useVendaCartStore();
  const [buscaProduto, setBuscaProduto] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FinalizarVendaFormValues>({
    resolver: zodResolver(finalizarVendaSchema),
    defaultValues: {
      desconto: 0,
      forma_pagamento: "DINHEIRO"
    }
  });

  const desconto = watch("desconto") || 0;
  const { subtotal, total } = useMemo(() => calcularTotalVenda(itens, desconto), [itens, desconto]);

  const caixaAtualQuery = useQuery({
    queryKey: caixaQueryKeys.sessaoAtual(usuario?.id ?? 0),
    queryFn: () => getCaixaAtualService(usuario!.id),
    enabled: Boolean(usuario)
  });

  const produtosQuery = useQuery({
    queryKey: vendaQueryKeys.produtosBusca(buscaProduto),
    queryFn: () => searchProdutosVendaService(buscaProduto),
    enabled: buscaProduto.trim().length >= 2
  });

  const clientesQuery = useQuery({
    queryKey: ["clientes", "venda"],
    queryFn: () => listClientesService({ ativo: true })
  });

  const finalizarVendaMutation = useMutation({
    mutationFn: createVendaService,
    onSuccess: async (vendaId) => {
      limpar();
      await queryClient.invalidateQueries({ queryKey: vendaQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
      navigate(appRoutes.vendaDetalhe.replace(":id", String(vendaId)));
    }
  });

  function handleAdicionarProduto(produtoId: number): void {
    const produto = produtosQuery.data?.find((item) => item.id === produtoId);
    if (!produto) {
      return;
    }

    const existente = itens.find((item) => item.produto_id === produto.id);
    const novaQuantidade = (existente?.quantidade ?? 0) + 1;

    if (!validarEstoqueDisponivel(produto, novaQuantidade)) {
      window.alert("Estoque insuficiente para este produto.");
      return;
    }

    adicionarItem(produto);
  }

  async function onSubmit(values: FinalizarVendaFormValues): Promise<void> {
    if (!usuario) {
      return;
    }

    if (!caixaAtualQuery.data) {
      window.alert("Nao e permitido finalizar venda sem caixa aberto.");
      return;
    }

    if (itens.length === 0) {
      window.alert("Adicione ao menos um item para finalizar a venda.");
      return;
    }

    if (desconto > subtotal) {
      window.alert("Desconto nao pode ser maior que o subtotal.");
      return;
    }

    await finalizarVendaMutation.mutateAsync({
      usuario_id: usuario.id,
      cliente_id: values.cliente_id,
      desconto: values.desconto,
      forma_pagamento: values.forma_pagamento,
      itens: itens.map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade
      }))
    });
  }

  const semCaixaAberto = !caixaAtualQuery.isLoading && !caixaAtualQuery.data;

  return (
    <section className="space-y-4">
      <PageTitle title="Nova Venda" description="Monte o carrinho e finalize a venda com caixa aberto." />

      {semCaixaAberto ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-sm text-destructive">
            <p>Nao existe sessao de caixa aberta para este usuario.</p>
            <Button variant="outline" onClick={() => navigate(appRoutes.caixaAbrir)}>
              Ir para abertura de caixa
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-6">
          <Label htmlFor="busca-produto">Buscar produto</Label>
          <Input
            id="busca-produto"
            placeholder="Digite nome, codigo ou codigo de barras"
            value={buscaProduto}
            onChange={(event) => setBuscaProduto(event.target.value)}
          />
          {produtosQuery.data && produtosQuery.data.length > 0 ? (
            <ProdutosBuscaLista produtos={produtosQuery.data} onAdicionar={(produto) => handleAdicionarProduto(produto.id)} />
          ) : (
            <p className="text-sm text-muted-foreground">Digite ao menos 2 caracteres para buscar produtos.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <h2 className="text-base font-semibold">Carrinho</h2>
          {itens.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          ) : (
            <CarrinhoItensTable itens={itens} onQuantidadeChange={alterarQuantidade} onRemover={removerItem} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2">
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente (opcional)</Label>
              <select id="cliente_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("cliente_id", { valueAsNumber: true })}>
                <option value="">Sem cliente</option>
                {(clientesQuery.data ?? []).map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto</Label>
              <Input id="desconto" type="number" step="0.01" min="0" {...register("desconto", { valueAsNumber: true })} />
              {errors.desconto ? <p className="text-xs text-destructive">{errors.desconto.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
              <select id="forma_pagamento" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("forma_pagamento")}>
                <option value="DINHEIRO">DINHEIRO</option>
                <option value="PIX">PIX</option>
                <option value="CARTAO_DEBITO">CARTAO_DEBITO</option>
                <option value="CARTAO_CREDITO">CARTAO_CREDITO</option>
              </select>
            </div>

            {finalizarVendaMutation.isError ? (
              <p className="text-sm text-destructive">{getErrorMessage(finalizarVendaMutation.error, "Falha ao finalizar venda. Verifique estoque e dados informados.")}</p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={semCaixaAberto || finalizarVendaMutation.isPending || itens.length === 0}>
                Finalizar venda
              </Button>
            </div>
          </form>

          <VendaResumoCard itens={itens} subtotal={subtotal} desconto={desconto} total={total} />
        </CardContent>
      </Card>
    </section>
  );
}

