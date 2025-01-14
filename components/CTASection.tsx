import { useState } from "react";
import { Send } from "lucide-react";

export default function CTASection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você adicionaria a lógica para processar o envio do formulário
    console.log("Email submetido:", email);
    setEmail("");
    alert("Obrigado pelo seu interesse! Entraremos em contato em breve.");
  };

  return (
    <section id="contato" className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Fale com um especialista agora mesmo!
        </h2>
        <p className="text-xl mb-8">
          Descubra como podemos otimizar sua integração Komache Connect com
          marketplaces.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="flex-grow px-4 py-2 rounded-l-md text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 flex items-center"
            >
              Enviar
              <Send className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm">Ou entre em contato via WhatsApp</p>
        <a
          href="https://wa.me/5551998664776?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20a%20integração%20Komache%20HUB%20com%20marketplaces."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
