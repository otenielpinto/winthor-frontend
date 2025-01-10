import { BarChart2, RefreshCw, TrendingUp } from 'lucide-react'

export default function Benefits() {
  const benefits = [
    {
      icon: <RefreshCw className="h-12 w-12 text-primary" />,
      title: "Automação de Estoque",
      description: "Sincronize automaticamente seu estoque entre o WinThor e os marketplaces, eliminando erros manuais."
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Atualização Ágil",
      description: "Atualize preços e disponibilidade de produtos em tempo real em todas as plataformas."
    },
    {
      icon: <BarChart2 className="h-12 w-12 text-primary" />,
      title: "Análise em Tempo Real",
      description: "Acesse relatórios integrados para analisar o desempenho de vendas em todos os canais."
    }
  ]

  return (
    <section id="beneficios" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Benefícios da Integração</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-center">{benefit.title}</h3>
              <p className="text-gray-600 text-center">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

