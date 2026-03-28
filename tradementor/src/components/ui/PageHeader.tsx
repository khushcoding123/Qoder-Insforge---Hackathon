"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PageHeaderProps {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ kicker, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("page-header", className)}>
      {kicker ? <div className="page-kicker">{kicker}</div> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
