"use client";
import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterSection } from "@/app/(private)/notas_fiscais/FilterSection";
import NfeTable from "@/app/(private)/notas_fiscais/NfeTable";
import { lib } from "@/lib/lib";

import { getOrdersByNfe } from "@/actions/actPedidos";
import { FiltersOrder } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";
import { RomaneioColeta } from "./romaneio/page";

const status_checkout_pendente = 0; // Pendente
const status_checkout_todos = -1; // Todos

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
    </div>
  );
}

export default function NfeList() {
  const currentDate = lib.dateToBr();

  const [filters, setFilters] = useState<FiltersOrder>({
    numero: "",
    startDate: currentDate,
    endDate: currentDate,
    ecommerceNumber: "",
    orderId: "",
    status: "NFe emitida",
    nome_cliente: "",
    checkout_status: status_checkout_todos,
    checkout_filter: "1",
  });

  const handleFilterChange = (newFilters: Partial<FiltersOrder>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const { data, error, isLoading } = useQuery<any[]>({
    queryKey: ["getNfePacotes", filters],
    queryFn: () => getOrdersByNfe(filters),
  });

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

      <Suspense fallback={<LoadingFallback />}>
        <NfeTable data={data || []} />;
      </Suspense>
    </div>
  );
}
