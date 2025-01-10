import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-light text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Conecte seu WinThor aos maiores marketplaces e otimize sua gestão de estoque!
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-fade-in-up animation-delay-300">
          Aumente suas vendas, automatize processos e reduza erros com nossa solução de integração completa.
        </p>
        <a href="#contato" className="inline-flex items-center bg-white text-primary font-bold py-3 px-6 rounded-full text-lg hover:bg-gray-100 transition duration-300 animate-fade-in-up animation-delay-600">
          Solicitar Demonstração
          <ArrowRight className="ml-2" />
        </a>
      </div>
    </section>
  )
}

