import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-white font-semibold mb-3">
              WTA Connect<span className="text-brand">.</span>
            </h3>
            <p className="text-zinc-400 text-sm">
              Soluções de integração para o seu negócio
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#beneficios" className="text-zinc-400 hover:text-white transition">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-zinc-400 hover:text-white transition">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-zinc-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#contato" className="text-zinc-400 hover:text-white transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contato</h3>
            <p className="text-zinc-400 text-sm">oteniel.pinto@gmail.com</p>
            <p className="text-zinc-400 text-sm mt-1">(51) 99866-4776</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-8 text-center">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} WTA Connect. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
