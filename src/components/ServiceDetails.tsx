import { FolderSyncIcon as Sync, LayoutGrid, Truck } from 'lucide-react'

export default function ServiceDetails() {
  const features = [
    {
      icon: <Sync className="h-8 w-8 text-primary" />,
      title: "Sincronização Automática",
      description: "Mantenha seu estoque e pedidos atualizados em tempo real entre o WinThor e os marketplaces."
    },
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: "Gestão Centralizada",
      description: "Gerencie múltiplos marketplaces a partir de uma única interface integrada ao WinThor."
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Integração Logística",
      description: "Compatível com diversas soluções de logística e pagamentos para uma operação fluida."
    }
  ]

  return (
    <section id="como-funciona" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona a Integração</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

