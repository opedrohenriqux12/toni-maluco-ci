import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { PageTitle } from "@/components/AppShell";
import { VerdictBadge, CountUp } from "@/components/Verdict";
import { platforms, netMargin, score, verdict, brl } from "@/lib/data";

export const Route = createFileRoute("/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de Margem — ToniMaluco C.I" },
      { name: "description", content: "Simule preço, custo e taxas e veja margem, score e veredito em tempo real." },
      { property: "og:title", content: "Calculadora de Margem — ToniMaluco C.I" },
      { property: "og:description", content: "Simule preço, custo e taxas e veja margem, score e veredito em tempo real." },
    ],
  }),
  component: Calc,
});

function Field({ label, value, min, max, step = 1, onChange, suffix }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="num">{suffix === "R$" ? brl(value) : `${value}${suffix ?? ""}`}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} />
    </div>
  );
}

function Calc() {
  const [plat, setPlat] = useState("ggmax");
  const [price, setPrice] = useState(60);
  const [cost, setCost] = useState(40);
  const [tax, setTax] = useState(6);
  const [demand, setDemand] = useState(70);
  const [competition, setCompetition] = useState(50);
  const [risk, setRisk] = useState(30);

  const m = netMargin(price, cost, plat, tax);
  const s = score({ price, cost, platform: plat, demand, competition, risk, liquidity: 65, timing: 60 });
  const v = verdict(s, risk);
  const p = platforms.find((x) => x.id === plat)!;
  const totalPct = p.fee + p.payment + tax;
  const minPrice = cost / (1 - totalPct / 100);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle kicker="Calculadora · Simulador E se?" title="Quanto sobra de verdade?">
        Arraste os controles. Margem, score e veredito recalculam na hora, já descontando taxas da plataforma, pagamento e impostos.
      </PageTitle>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="glass space-y-6 p-6 lg:col-span-3">
          <div className="flex flex-wrap gap-2">
            {platforms.map((x) => (
              <button key={x.id} onClick={() => setPlat(x.id)} className={`rounded-full border px-3 py-1 text-xs transition ${plat === x.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {x.name} <span className="num opacity-70">{x.fee + x.payment}%</span>
              </button>
            ))}
          </div>
          <Field label="Preço de venda" value={price} min={5} max={500} onChange={setPrice} suffix="R$" />
          <Field label="Custo do item" value={cost} min={1} max={400} onChange={setCost} suffix="R$" />
          <Field label="Impostos" value={tax} min={0} max={20} step={0.5} onChange={setTax} suffix="%" />
          <Field label="Demanda" value={demand} min={0} max={100} onChange={setDemand} />
          <Field label="Concorrência" value={competition} min={0} max={100} onChange={setCompetition} />
          <Field label="Risco" value={risk} min={0} max={100} onChange={setRisk} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="glass glow shimmer-border p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score de Oportunidade</span>
              <VerdictBadge v={v} />
            </div>
            <div className="mt-2 text-6xl font-semibold"><CountUp value={s} /></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s}%`, background: "var(--gradient-primary)" }} />
            </div>
          </div>
          <div className="glass grid grid-cols-2 gap-4 p-6">
            <div><p className="text-xs text-muted-foreground">Lucro por venda</p><p className={`text-2xl ${m.profit < 0 ? "text-avoid" : "text-invest"}`}><CountUp value={m.profit} format={brl} /></p></div>
            <div><p className="text-xs text-muted-foreground">Margem líquida</p><p className="text-2xl"><CountUp value={m.pct} format={(n) => `${n.toFixed(1)}%`} /></p></div>
            <div><p className="text-xs text-muted-foreground">Taxas + impostos</p><p className="num text-lg">{brl(m.fees)}</p></div>
            <div><p className="text-xs text-muted-foreground">Preço mínimo (empate)</p><p className="num text-lg">{brl(minPrice)}</p></div>
            <div><p className="text-xs text-muted-foreground">Preço ideal (+25%)</p><p className="num text-lg text-primary">{brl(minPrice * 1.25)}</p></div>
            <div><p className="text-xs text-muted-foreground">Preço agressivo (+10%)</p><p className="num text-lg">{brl(minPrice * 1.1)}</p></div>
          </div>
          <p className="text-xs text-muted-foreground">Pesos do score: demanda 25%, margem 25%, concorrência 15%, risco 15%, liquidez 10%, timing 10%. Risco acima de 75 força EVITAR.</p>
        </div>
      </div>
    </div>
  );
}
