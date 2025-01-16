"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterSection } from "./FilterSection";
import { getOrdersByNfe } from "@/actions/actPedidos";
import { FiltersOrder } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";
import NfeTable from "./NfeTable";

export default function NfeList() {
  const currentDate = new Date();

  const [filters, setFilters] = useState<FiltersOrder>({
    numero: "",
    startDate: currentDate,
    endDate: currentDate,
    ecommerceNumber: "",
    orderId: "",
    status: "",
    nome_cliente: "",
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

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
        </div>
      ) : (
        <NfeTable data={data || []} />
      )}
    </div>
  );
}
