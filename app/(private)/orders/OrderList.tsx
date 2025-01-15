"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./DataTable";
import { columns } from "./columns";
import { FilterSection } from "./FilterSection";
import { Button } from "@/components/ui/button";
import { Order } from "./orderTypes";
import { getOrders } from "@/actions/actPedidos";
import { FiltersOrder } from "@/types/OrderTypes";
import { Loader2 } from "lucide-react";

export default function OrderList() {
  const currentDate = new Date();

  const [filters, setFilters] = useState<FiltersOrder>({
    numero: "",
    startDate: currentDate,
    endDate: currentDate,
    ecommerceNumber: "",
    orderId: "",
    status: "",
  });

  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
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

      <div className="text-right">
        Total de registros: {data ? data.length : 0}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
