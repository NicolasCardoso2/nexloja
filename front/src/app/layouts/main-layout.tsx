import { Outlet } from "react-router-dom";
import { AppHeader } from "@/shared/components/app-header";
import { Sidebar } from "@/shared/components/sidebar";

export function MainLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
