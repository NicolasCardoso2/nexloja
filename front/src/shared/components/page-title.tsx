import { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageTitle({ title, description, actions }: PageTitleProps): JSX.Element {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
