"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaltaEstoqueDataTable } from "./DataTable";
import { columns } from "./columns";
import { FaltaEstoqueFilterSection } from "./FilterSection";
import { getFaltaEstoqueWithFilters } from "@/actions/faltaEstoqueAction";
import { Loader2 } from "lucide-react";
import { lib } from "@/lib/lib";

interface FaltaEstoqueFilters {
  startDate: Date | null;
  endDate: Date | null;
  descricao: string;
  codigo: string;
  id_produto: string;
}

export default function FaltaEstoqueList() {
  const currentDate = new Date();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [filters, setFilters] = useState<FaltaEstoqueFilters>({
    startDate: lib.setUTCHoursStart(currentDate),
    endDate: lib.setUTCHoursEnd(currentDate),

    descricao: "",
    codigo: "",
    id_produto: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["faltaEstoque", filters, searchTrigger],
    queryFn: () =>
      getFaltaEstoqueWithFilters({
        startDate: filters.startDate,
        endDate: filters.endDate,
        descricao: filters.descricao,
        codigo: filters.codigo,
        id_produto: filters.id_produto,
      }),
    enabled: searchTrigger > 0, // Only executes when searchTrigger > 0
  });

  const handleFilterChange = (newFilters: Partial<FaltaEstoqueFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setHasSearched(true);
    // Increment trigger to force a new search
    setSearchTrigger((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        Erro ao carregar produtos em falta: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FaltaEstoqueFilterSection
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
          Carregando produtos em falta de estoque...
        </div>
      ) : hasSearched ? (
        <FaltaEstoqueDataTable columns={columns} data={data || []} />
      ) : (
        <div className="text-center text-gray-500 py-8">
          Configure os filtros e clique em "Buscar" para visualizar os produtos
          em falta de estoque
        </div>
      )}
    </div>
  );
}
