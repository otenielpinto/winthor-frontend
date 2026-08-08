import { Star } from "lucide-react";

const stats = [
  { value: "+35%", label: "aumento de vendas" },
  { value: "90%", label: "menos erros manuais" },
  { value: "10.000+", label: "produtos gerenciados" },
  { value: "24/7", label: "monitoramento" },
];

const testimonials = [
  {
    quote:
      "Com a integração, conseguimos aumentar nossas vendas em 35% no Mercado Livre e eliminamos 90% dos erros de atualização de estoque.",
    author: "Atacado ***",
  },
  {
    quote:
      "Automatizamos a gestão de mais de 10.000 produtos com nossa solução WinThor integrada ao Tiny ERP.",
    author: "Distribuidora ***",
  },
];

function getInitials(author: string): string {
  return author
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SocialProof() {
  return (
    <section className="py-24 bg-zinc-900/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-24">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-4xl font-bold text-white">
                {stat.value}
              </p>
              <p className="text-zinc-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-brand text-xs font-semibold tracking-widest text-center mb-4">
          DEPOIMENTOS
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-12">
          O que nossos clientes dizem
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6"
            >
              <div className="flex gap-1 mb-4 text-brand" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-zinc-300 italic leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand/60 to-brand/20 text-brand-foreground font-bold flex items-center justify-center text-sm mr-3">
                  {getInitials(testimonial.author)}
                </div>
                <span className="font-semibold text-white">
                  {testimonial.author}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
