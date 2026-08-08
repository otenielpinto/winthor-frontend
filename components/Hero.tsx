import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

const stats = [
  { value: "+35%", label: "aumento de vendas" },
  { value: "10k+", label: "produtos sincronizados" },
  { value: "90%", label: "menos erros manuais" },
];

const marketplaces = [
  { name: "Mercado Livre", trend: "+12% hoje" },
  { name: "Magalu", trend: "+8% hoje" },
  { name: "Olist", trend: "+5% hoje" },
  { name: "Tiny ERP", trend: "+9% hoje" },
];

const bars = [40, 65, 45, 80, 60, 95, 75];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090b] pt-32 pb-24">
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />
      <div
        className="absolute -top-40 right-0 w-[600px] h-[600px] bg-glow-lime"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-950 to-transparent"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 animate-fade-in-up">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            Integração WinThor × Marketplaces
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mt-6 animate-fade-in-up [animation-delay:100ms]">
            Conecte seu WinThor aos maiores{" "}
            <span className="text-brand">marketplaces</span>
          </h1>

          <p className="text-zinc-400 text-lg mt-6 max-w-xl animate-fade-in-up [animation-delay:200ms]">
            Aumente suas vendas, automatize processos e reduza erros com uma
            integração completa de estoque, pedidos e logística — tudo em tempo
            real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-fade-in-up [animation-delay:300ms]">
            <a
              href="#contato"
              className="inline-flex items-center justify-center bg-brand text-brand-foreground hover:bg-brand-light font-semibold rounded-lg px-6 py-3 transition"
            >
              Solicitar Demonstração
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center border border-white/10 text-white hover:border-white/25 rounded-lg px-6 py-3 font-semibold transition"
            >
              Como funciona
            </a>
          </div>

          <div className="flex mt-12 pt-6 border-t border-white/10 divide-x divide-white/10 animate-fade-in-up [animation-delay:400ms]">
            {stats.map((stat) => (
              <div key={stat.label} className="flex-1 px-6 first:pl-0">
                <p className="font-display text-2xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-in-up [animation-delay:200ms]">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-zinc-400">
                WTA Connect · Estoque
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {marketplaces.map((mp) => (
                <div
                  key={mp.name}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span className="text-sm text-zinc-200">{mp.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Sincronizado</span>
                    <span className="rounded-full bg-brand/10 text-brand text-xs px-2 py-0.5">
                      {mp.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400">Vendas · últimos 7 dias</span>
                <span className="text-xs text-brand font-semibold">+35%</span>
              </div>
              <div className="flex items-end gap-2 h-24" aria-hidden="true">
                {bars.map((height, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t ${
                      index === 5 ? "bg-brand" : "bg-white/10"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -top-6 -right-4 md:-right-6 animate-float">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-3 shadow-xl flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-white">+35%</p>
                <p className="text-[10px] text-zinc-500">vendas este mês</p>
              </div>
            </div>
          </div>

          <div
            className="absolute -bottom-6 -left-4 md:-left-6 animate-float [animation-delay:2s]"
            aria-hidden="true"
          >
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-3 shadow-xl flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Estoque atualizado</p>
                <p className="text-[10px] text-zinc-500">agora mesmo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
