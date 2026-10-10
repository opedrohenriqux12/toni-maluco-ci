import { TrendingUp, FlaskConical, ShieldAlert } from "lucide-react";
import type { Verdict } from "@/lib/data";
import { useEffect, useRef, useState } from "react";

const map = {
  INVESTIR: { cls: "text-invest border-invest/40 bg-invest/10 shadow-[0_0_18px_-4px_var(--invest)]", Icon: TrendingUp },
  TESTAR: { cls: "text-test border-test/40 bg-test/10 shadow-[0_0_18px_-4px_var(--test)]", Icon: FlaskConical },
  EVITAR: { cls: "text-avoid border-avoid/40 bg-avoid/10 shadow-[0_0_18px_-4px_var(--avoid)]", Icon: ShieldAlert },
};

export function VerdictBadge({ v }: { v: Verdict }) {
  const { cls, Icon } = map[v];
  return (
    <span key={v} className={`rise inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-bold tracking-wider transition-all duration-300 ${cls}`}>
      <Icon className="h-3 w-3" /> {v}
    </span>
  );
}

export function CountUp({ value, format = (n: number) => Math.round(n).toString() }: { value: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 500);
      const e = 1 - Math.pow(1 - k, 3);
      setN(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="num">{format(n)}</span>;
}
