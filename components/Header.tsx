import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          WTA Connect
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link
            href="#beneficios"
            className="text-gray-600 hover:text-primary transition duration-300"
          >
            Benefícios
          </Link>
          <Link
            href="#como-funciona"
            className="text-gray-600 hover:text-primary transition duration-300"
          >
            Como Funciona
          </Link>
          <Link
            href="#faq"
            className="text-gray-600 hover:text-primary transition duration-300"
          >
            FAQ
          </Link>

          <Link
            href="/sign-in"
            className="text-gray-600 hover:text-primary transition duration-300"
          >
            Login
          </Link>

          <Link
            href="#contato"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition duration-300"
          >
            Fale Conosco
          </Link>
        </nav>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2">
          <Link
            href="#beneficios"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Benefícios
          </Link>
          <Link
            href="#como-funciona"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Como Funciona
          </Link>
          <Link
            href="#faq"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            FAQ
          </Link>
          <Link
            href="/sign-in"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            href="#contato"
            className="block px-4 py-2 text-primary font-semibold hover:bg-gray-100"
          >
            Fale Conosco
          </Link>
        </div>
      )}
    </header>
  );
}
