import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">WTA Connect</h3>
            <p>Soluções de integração para o seu negócio</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Links Rápidos</h3>
            <ul>
              <li>
                <Link href="#beneficios" className="hover:text-gray-300">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="hover:text-gray-300">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-gray-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#contato" className="hover:text-gray-300">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Contato</h3>
            <p>oteniel.pinto@gmail.com</p>
            <p>(51) 99866-4776</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} WTA Connect. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
