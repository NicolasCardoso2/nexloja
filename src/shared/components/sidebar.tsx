import { Package, LayoutDashboard, Users, Warehouse, ShoppingCart, LineChart, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { cn } from "@/shared/lib/cn";

type LinkItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const links: LinkItem[] = [
  { to: appRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: appRoutes.produtos, label: "Produtos", icon: Package },
  { to: appRoutes.clientes, label: "Clientes", icon: Users },
  { to: appRoutes.estoque, label: "Estoque", icon: Warehouse },
  { to: appRoutes.vendas, label: "Vendas", icon: ShoppingCart },
  { to: appRoutes.caixaAbrir, label: "Caixa", icon: Wallet },
  { to: appRoutes.relatorios, label: "Relatorios", icon: LineChart },
  { to: appRoutes.configuracoes, label: "Configuracoes", icon: Settings, adminOnly: true }
];

export function Sidebar(): JSX.Element {
  const perfil = useAuthStore((state) => state.usuario?.perfil);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card p-4 md:block">
      <nav className="space-y-1">
        {links
          .filter((link) => !link.adminOnly || perfil === "ADMIN")
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
