import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts/main-layout";
import { ProtectedRoute } from "@/app/router/protected-route";
import { appRoutes } from "@/app/constants/routes";
import { LoginPage } from "@/pages/login/login-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { ProdutosPage } from "@/pages/produtos/produtos-page";
import { ProdutoDetalhePage } from "@/pages/produtos/produto-detalhe-page";
import { ProdutoFormPage } from "@/pages/produtos/produto-form-page";
import { EstoquePage } from "@/pages/estoque/estoque-page";
import { MovimentacaoEstoquePage } from "@/pages/estoque/movimentacao-estoque-page";
import { ClientesPage } from "@/pages/clientes/clientes-page";
import { ClienteDetalhePage } from "@/pages/clientes/cliente-detalhe-page";
import { ClienteFormPage } from "@/pages/clientes/cliente-form-page";
import { VendasPage } from "@/pages/vendas/vendas-page";
import { NovaVendaPage } from "@/pages/vendas/nova-venda-page";
import { VendaDetalhePage } from "@/pages/vendas/venda-detalhe-page";
import { RelatoriosPage } from "@/pages/relatorios/relatorios-page";
import { ConfiguracoesPage } from "@/pages/configuracoes/configuracoes-page";
import { AberturaCaixaPage } from "@/pages/caixa/abertura-caixa-page";
import { FechamentoCaixaPage } from "@/pages/caixa/fechamento-caixa-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={appRoutes.dashboard} replace />
  },
  {
    path: appRoutes.login,
    element: <LoginPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: appRoutes.dashboard, element: <DashboardPage /> },
          { path: appRoutes.produtos, element: <ProdutosPage /> },
          { path: appRoutes.produtoNovo, element: <ProdutoFormPage /> },
          { path: appRoutes.produtoDetalhe, element: <ProdutoDetalhePage /> },
          { path: appRoutes.produtoEditar, element: <ProdutoFormPage /> },
          { path: appRoutes.estoque, element: <EstoquePage /> },
          { path: appRoutes.estoqueMovimentar, element: <MovimentacaoEstoquePage /> },
          { path: appRoutes.clientes, element: <ClientesPage /> },
          { path: appRoutes.clienteNovo, element: <ClienteFormPage /> },
          { path: appRoutes.clienteDetalhe, element: <ClienteDetalhePage /> },
          { path: appRoutes.clienteEditar, element: <ClienteFormPage /> },
          { path: appRoutes.vendas, element: <VendasPage /> },
          { path: appRoutes.vendaNova, element: <NovaVendaPage /> },
          { path: appRoutes.vendaDetalhe, element: <VendaDetalhePage /> },
          { path: appRoutes.relatorios, element: <RelatoriosPage /> },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: appRoutes.configuracoes, element: <ConfiguracoesPage /> },
              { path: appRoutes.caixaFechar, element: <FechamentoCaixaPage /> }
            ]
          },
          { path: appRoutes.caixaAbrir, element: <AberturaCaixaPage /> }
        ]
      }
    ]
  }
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
