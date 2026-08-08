"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // ponytail: form is client-side placeholder — wire to a server action when email infra exists
    setSubmitted(true);
  };

  return (
    <section id="contato" className="relative overflow-hidden py-24 bg-[#09090b]">
      <div className="absolute inset-0 bg-glow-lime" aria-hidden="true" />
      <div className="relative container mx-auto px-4 text-center">
        <p className="text-brand text-xs font-semibold tracking-widest mb-4">
          CONTATO
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          Fale com um especialista agora mesmo!
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
          Descubra como podemos otimizar sua integração WTA Connect com
          marketplaces.
        </p>

        {submitted ? (
          <div className="max-w-md mx-auto rounded-2xl border border-brand/40 bg-brand/10 p-8 flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-brand mb-4" />
            <p className="text-white font-semibold">
              Obrigado! Entraremos em contato em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-grow bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand px-4 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-brand text-brand-foreground hover:bg-brand-light font-semibold rounded-lg px-6 py-3 transition flex items-center justify-center"
              >
                Enviar
                <Send className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-sm text-zinc-500">
          Ou entre em contato via WhatsApp
        </p>
        <a
          href="https://wa.me/5551998664776?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20a%20integração%20WTA%20Connect%20com%20marketplaces."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 border border-brand/40 text-brand hover:bg-brand/10 rounded-lg px-6 py-3 font-semibold transition"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
