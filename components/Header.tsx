"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-display text-2xl font-bold text-white">
          WTA Connect<span className="text-brand">.</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-400 hover:text-white transition duration-300"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="text-zinc-400 hover:text-white transition duration-300"
          >
            Login
          </Link>
          <Link
            href="#contato"
            className="bg-brand text-brand-foreground hover:bg-brand-light font-semibold rounded-lg px-4 py-2 transition"
          >
            Fale Conosco
          </Link>
        </nav>

        <button
          className="md:hidden text-zinc-300 hover:text-white transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden bg-zinc-950/95 backdrop-blur-md transition-all duration-300 ${
          isMenuOpen ? "max-h-96 border-t border-white/5" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-zinc-400 hover:text-white transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="block px-4 py-3 text-zinc-400 hover:text-white transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="#contato"
            className="block px-4 py-3 mt-2 mb-4 text-center bg-brand text-brand-foreground font-semibold rounded-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            Fale Conosco
          </Link>
        </div>
      </div>
    </header>
  );
}
