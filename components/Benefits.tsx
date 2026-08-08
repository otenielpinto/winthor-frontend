import { BarChart2, RefreshCw, TrendingUp } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Automação de Estoque",
      description:
        "Sincronize automaticamente seu estoque entre o WinThor e os marketplaces, eliminando erros manuais.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Atualização Ágil",
      description:
        "Atualize preços e disponibilidade de produtos em tempo real em todas as plataformas.",
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      title: "Análise em Tempo Real",
      description:
        "Acesse relatórios integrados para analisar o desempenho de vendas em todos os canais.",
    },
  ];

  return (
    <section id="beneficios" className="py-24 bg-[#09090b]">
      <div className="container mx-auto px-4">
        <p className="text-brand text-xs font-semibold tracking-widest text-center mb-4">
          POR QUE WTA CONNECT
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Benefícios da Integração
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8 hover:border-brand/40 hover:-translate-y-1.5 transition duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {benefit.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
