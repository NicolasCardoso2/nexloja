import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";

type KpiCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export function KpiCard({ title, value, helper, icon }: KpiCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon ?? null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
