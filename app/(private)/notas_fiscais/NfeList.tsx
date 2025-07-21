"use client";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterSection } from "./FilterSection";
import { getOrdersByNfe } from "@/actions/pedidoAction";
import { FiltersOrder } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";
import NfeTable from "./NfeTable";
import { lib } from "@/lib/lib";

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
    checkout_status: -1, // Added checkout_status filter with empty string as default
  });

  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["getOrdersByNfe", filters],
    queryFn: () => getOrdersByNfe(filters),
  });

  const handleFilterChange = (newFilters: Partial<FiltersOrder>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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

      <Suspense fallback={<Loader2 className="h-24 w-24 animate-spin" />}>
        <NfeTable data={data || []} />
      </Suspense>

      {/* {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
        </div>
      ) : (
        <Suspense fallback={<Loader2 className="h-24 w-24 animate-spin" />}>
          <NfeTable data={data || []} />
        </Suspense>
      )} */}
    </div>
  );
}
