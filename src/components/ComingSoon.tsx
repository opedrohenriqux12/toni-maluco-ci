import type { ReactNode } from "react";
import { PageTitle } from "@/components/AppShell";

export function ModulePreview({ kicker, title, intro, items, children }: { kicker: string; title: string; intro: string; items: { t: string; d: string }[]; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle kicker={kicker} title={title}>{intro}</PageTitle>
      {children}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((i, k) => (
          <div key={i.t} className="glass rise p-5 transition hover:-translate-y-0.5 hover:glow" style={{ animationDelay: `${k * 60}ms` }}>
            <p className="font-display font-semibold">{i.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
