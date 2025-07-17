"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { FiltersOrder, statusOptions } from "@/types/OrderTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSectionProps {
  filters: FiltersOrder;
  onFilterChange: (filters: Partial<FilterSectionProps["filters"]>) => void;
  isLoading?: boolean;
}

export function FilterSection({
  filters,
  onFilterChange,
  isLoading,
}: FilterSectionProps) {
  const currentDate = new Date();

  const [localFilters, setLocalFilters] = useState({
    ...filters,
    startDate: filters.startDate || currentDate,
    endDate: filters.endDate || currentDate,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: Date | null
  ) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, status: value }));
  };

  const handleClearFilters = () => {
    const clearedFilters: any = {
      numero: "",
      startDate: currentDate,
      endDate: currentDate,
      orderId: "",
      ecommerceNumber: "",
      status: "",
      nome_cliente: "",
    };
    setLocalFilters(clearedFilters);
  };

  const handleSubmitFilters = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !localFilters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.startDate ? (
                  format(localFilters.startDate, "dd/MM/yyyy")
                ) : (
                  <span>Data Inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.startDate}
                onSelect={(date: any) => handleDateChange("startDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !localFilters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.endDate ? (
                  format(localFilters.endDate, "dd/MM/yyyy")
                ) : (
                  <span>Data Final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.endDate}
                onSelect={(date: any) => handleDateChange("endDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Input
          placeholder="Numero do Pedido"
          name="numero"
          value={localFilters.numero}
          onChange={handleInputChange}
        />

        <Input
          placeholder="Numero Ecommerce"
          name="ecommerceNumber"
          value={localFilters.ecommerceNumber}
          onChange={handleInputChange}
        />

        <Input
          placeholder="Codigo Sistema WINTHOR"
          name="orderId"
          value={localFilters.orderId}
          onChange={handleInputChange}
        />

        <Input
          placeholder="Informe o nome do cliente"
          name="nome_cliente"
          value={localFilters.nome_cliente}
          onChange={handleInputChange}
        />

        <Select
          onValueChange={handleStatusChange}
          value={localFilters.status || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={"todos"} value={"Todos"}>
              {"Todos"}
            </SelectItem>

            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleClearFilters} variant="outline">
          Limpar Filtros
        </Button>
        <Button onClick={handleSubmitFilters} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Buscando..." : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
