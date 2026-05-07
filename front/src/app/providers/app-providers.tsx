// Aqui ficam os "providers" contextos que precisam envolver o app inteiro.
// Hoje só tem o React Query, mas se precisar adicionar mais (tema, toast, etc)
// é aqui que entra.
//
// Por que o QueryClient está no useState?
// Para garantir que cada teste ou renderização isolada crie uma instância nova,
// evitando que o cache de uma render contamine outra.
//
// Configurações que valem a pena entender:
//   staleTime: 30s → não busca de novo se os dados têm menos de 30s
//   refetchOnWindowFocus: false → não dispara fetch ao alt+tab de volta pro app
//     (no Electron isso causava pisca-pisca desnecessário)

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
