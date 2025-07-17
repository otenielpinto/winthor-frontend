"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { FilterSection } from "./FilterSection";
import { getOrders } from "@/actions/actPedidos";
import { FiltersOrder } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";
import { subDays } from "date-fns";

// Função para calcular a data anterior baseada no dia da semana
const getPreviousWorkingDate = (date: Date): Date => {
  const dayOfWeek = date.getDay(); // 0 = domingo, 1 = segunda, 2 = terça, etc.

  if (dayOfWeek === 1) {
    // Segunda-feira
    return subDays(date, 3); // Subtrai 3 dias (volta para sexta-feira)
  }

  return subDays(date, 1); // Dias normais, subtrai 1 dia
};

export default function OrderList() {
  const currentDate = new Date();
  const previousDate = getPreviousWorkingDate(currentDate);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [filters, setFilters] = useState<FiltersOrder>({
    numero: "",
    startDate: previousDate,
    endDate: currentDate,
    ecommerceNumber: "",
    orderId: "",
    status: "",
  });

  const { data, isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["orders", filters, searchTrigger],
    queryFn: () => getOrders(filters),
    enabled: searchTrigger > 0, // Só executa quando searchTrigger > 0
  });

  const handleFilterChange = (newFilters: Partial<FiltersOrder>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setHasSearched(true);
    // Incrementa o trigger para forçar uma nova busca
    setSearchTrigger((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading orders: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {hasSearched && (
        <div className="text-right">
          Total de registros: {data ? data.length : 0}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Carregando...
        </div>
      ) : hasSearched ? (
        <DataTable columns={columns} data={data || []} />
      ) : (
        <div className="text-center text-gray-500 py-8">
          Configure os filtros e clique em "Enviar" para buscar os pedidos
        </div>
      )}
    </div>
  );
}
