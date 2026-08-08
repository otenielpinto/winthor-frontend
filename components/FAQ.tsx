"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Quanto tempo leva para configurar a integração?",
      answer:
        "O tempo de configuração varia dependendo da complexidade do seu catálogo e dos marketplaces envolvidos. Geralmente, conseguimos realizar a integração em 2 a 4 semanas.",
    },
    {
      question: "Quais marketplaces são suportados?",
      answer:
        "Nossa solução suporta integração com os principais marketplaces do Brasil, incluindo Mercado Livre, Olist, Tiny, B2W, Magazine Luiza, entre outros. Estamos constantemente adicionando novas integrações.",
    },
    {
      question: "Como funciona o suporte técnico após a implementação?",
      answer:
        "Oferecemos suporte técnico dedicado por telefone, e-mail e chat durante o horário comercial. Além disso, disponibilizamos uma base de conhecimento online com tutoriais e FAQs para ajuda imediata.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-zinc-900/40">
      <div className="container mx-auto px-4">
        <p className="text-brand text-xs font-semibold tracking-widest text-center mb-4">
          DÚVIDAS
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Perguntas Frequentes
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-white/10">
              <button
                className="py-5 w-full flex justify-between items-center text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-white font-semibold pr-4">
                  {faq.question}
                </span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-brand transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
