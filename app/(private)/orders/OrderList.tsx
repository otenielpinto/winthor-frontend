"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { FilterSection } from "./FilterSection";
import { getOrders } from "@/actions/pedidoAction";
import { FiltersOrder, PaginatedOrderResult } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";
import { subDays } from "date-fns";

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FiltersOrder>({
    numero: "",
    startDate: previousDate,
    endDate: currentDate,
    ecommerceNumber: "",
    orderId: "",
    status: "",
  });

  const {
    data: result,
    isLoading,
    isFetching,
    error,
  } = useQuery<PaginatedOrderResult>({
    queryKey: ["orders", filters, searchTrigger, page, PAGE_SIZE],
    queryFn: () => getOrders({ ...filters, page, pageSize: PAGE_SIZE }),
    enabled: searchTrigger > 0,
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (newFilters: Partial<FiltersOrder>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // reset para primeira página ao trocar filtros
    setHasSearched(true);
    setSearchTrigger((prev) => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        Erro ao carregar pedidos: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isFetching}
      />

      {isLoading && !result ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Carregando...
        </div>
      ) : hasSearched ? (
        <DataTable
          columns={columns}
          data={result?.data ?? []}
          total={result?.total}
          currentPage={result?.page}
          pageSize={result?.pageSize}
          totalPages={result?.totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          Configure os filtros e clique em &quot;Enviar&quot; para buscar os
          pedidos
        </div>
      )}
    </div>
  );
}
