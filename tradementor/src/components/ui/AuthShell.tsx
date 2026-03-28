"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/Brand";
import { cn } from "@/lib/cn";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthShell({ title, description, children, footer, className }: AuthShellProps) {
  return (
    <div className="auth-shell grid-bg">
      <div className={cn("auth-shell-frame max-w-md", className)}>
        <Link href="/" className="site-logo-lockup auth-shell-brand">
          <BrandLockup
            markClassName="h-10 w-10"
            textClassName="text-xl font-bold tracking-tight text-white"
          />
        </Link>

        <div className="auth-shell-main">
          <div className="premium-panel auth-card">
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
            </div>
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
