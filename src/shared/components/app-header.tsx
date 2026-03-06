import { LogOut, Store } from "lucide-react";
import { Button } from "@/shared/components/button";
import { useAuthStore } from "@/app/store/auth-store";

export function AppHeader(): JSX.Element {
  const usuario = useAuthStore((state) => state.usuario);
  const sair = useAuthStore((state) => state.sair);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="h-4 w-4" />
        <span>NEXLOJA</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{usuario?.nome}</p>
          <p className="text-xs text-muted-foreground">{usuario?.perfil}</p>
        </div>
        <Button variant="outline" size="sm" onClick={sair}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
