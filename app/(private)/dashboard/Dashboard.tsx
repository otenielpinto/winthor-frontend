"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MetricCards from "./MetricCards";
import OrdersChart from "./OrdersChart";
import StatusPieChart from "./StatusPieChart";
import OrdersTable from "./OrdersTable";
import FilterBar from "./FilterBar";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { getDashboardOrders } from "@/actions/pedidoAction";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    period: "daily",
    status: "todos",
    regiao: "todas",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData", filters],
    queryFn: async () => await getDashboardOrders(filters),
    refetchInterval: 8 * 60 * 1000, // Atualizar dados a cada 6 minutos
  });

  const exportData = () => {
    if (!data) return;

    const csvContent = [
      ["ID", "Data", "Status", "Valor", "Região"],
      ...data.recentOrders.map((order) => [
        order.id,
        order.date,
        order.status,
        order.value.toFixed(2),
        order.region,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "amazon_marketplace_orders.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-amazon-orange">
        Painel de Controle{" "}
      </h1>

      <FilterBar filters={filters} setFilters={setFilters} />
      <MetricCards data={data} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <OrdersChart data={data} />
        <StatusPieChart data={data} />
      </div>
      {/* <OrdersTable data={data} /> */}
      <div className="flex justify-between items-center mt-4">
        <Button onClick={exportData}>Exportar Dados</Button>
        <div className="flex items-center text-red-500">
          <AlertCircle className="mr-2" />
          <span>
            {
              data?.recentOrders.filter(
                (order) => order.status === "Em processamento"
              ).length
            }{" "}
            pedidos com possível atraso
          </span>
        </div>
      </div>
    </div>
  );
}
