import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: ReactNode;
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, meta, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {meta || children ? (
        <div className="header-actions">
          {meta ? <p className="muted">{meta}</p> : null}
          {children}
        </div>
      ) : null}
    </header>
  );
}
