import { LayoutGrid, Truck, FolderSyncIcon as Sync } from "lucide-react";

export default function ServiceDetails() {
  const steps = [
    {
      number: "01",
      icon: <Sync className="h-6 w-6" />,
      title: "Sincronização Automática",
      description:
        "Mantenha seu estoque e pedidos atualizados em tempo real entre o WinThor e os marketplaces.",
    },
    {
      number: "02",
      icon: <LayoutGrid className="h-6 w-6" />,
      title: "Gestão Centralizada",
      description:
        "Gerencie múltiplos marketplaces a partir de uma única interface integrada ao WinThor.",
    },
    {
      number: "03",
      icon: <Truck className="h-6 w-6" />,
      title: "Integração Logística",
      description:
        "Compatível com diversas soluções de logística e pagamentos para uma operação fluida.",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-[#09090b]">
      <div className="container mx-auto px-4">
        <p className="text-brand text-xs font-semibold tracking-widest text-center mb-4">
          COMO FUNCIONA
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Como Funciona a Integração
        </h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div
            className="hidden md:block absolute top-8 left-[16%] right-[16%] border-t border-dashed border-white/10"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <p className="font-display text-5xl font-bold text-white/10">
                {step.number}
              </p>
              <div className="h-14 w-14 mx-auto mt-6 mb-6 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
