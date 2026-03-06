import { PageTitle } from "@/shared/components/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/card";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps): JSX.Element {
  return (
    <section>
      <PageTitle title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Modulo em construcao</CardTitle>
          <CardDescription>Estrutura pronta para receber regras e integracao com SQLite.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta tela ja esta registrada na navegacao e nas rotas obrigatorias do MVP.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
