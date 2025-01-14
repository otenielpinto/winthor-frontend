import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'

export default function MetricCards({ data }) {
  if (!data) return null

  const metrics = [
    {
      title: 'Total de Pedidos',
      value: data.totalOrders,
      tooltip: 'Número total de pedidos no período selecionado'
    },
    {
      title: 'Volume de Vendas',
      value: `R$ ${data.salesVolume.toFixed(2)}`,
      tooltip: 'Valor total das vendas no período selecionado'
    },
    {
      title: 'Tempo Médio de Processamento',
      value: `${data.averageProcessingTime.toFixed(2)} horas`,
      tooltip: 'Tempo médio entre a realização do pedido e o envio'
    },
    {
      title: 'Taxa de Cancelamento',
      value: `${data.cancellationRate.toFixed(2)}%`,
      tooltip: 'Porcentagem de pedidos cancelados em relação ao total'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{metric.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

