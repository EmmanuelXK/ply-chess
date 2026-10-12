"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeaderBar({
  backHref,
  backLabel,
  kicker,
  title,
  titleTestId,
  subtitle,
  actions,
}: {
  backHref: string;
  backLabel: string;
  kicker: string;
  title: string;
  titleTestId?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <Button asChild variant="ghost" size="icon-sm">
        <Link href={backHref} aria-label={backLabel}>
          <ChevronLeft />
        </Link>
      </Button>
      <div className="board-heading">
        <p className="board-kicker">{kicker}</p>
        <h1 data-testid={titleTestId}>{title}</h1>
        {subtitle ? <div className="board-sub">{subtitle}</div> : null}
      </div>
      {actions}
    </>
  );
}
