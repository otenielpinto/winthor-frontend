import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
        "Nossa solução suporta integração com os principais marketplaces do Brasil, incluindo Mercado Livre, Olist Tiny , B2W, Magazine Luiza, entre outros. Estamos constantemente adicionando novas integrações.",
    },
    {
      question: "Como funciona o suporte técnico após a implementação?",
      answer:
        "Oferecemos suporte técnico dedicado por telefone, e-mail e chat durante o horário comercial. Além disso, disponibilizamos uma base de conhecimento online com tutoriais e FAQs para ajuda imediata.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Perguntas Frequentes
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border-b border-gray-200 pb-4">
              <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                {openIndex === index ? <ChevronUp /> : <ChevronDown />}
              </button>
              {openIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
