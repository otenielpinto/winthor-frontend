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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
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

  const [debouncedFilters, debounceFilterChange] = useDebounce(
    localFilters,
    300
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    debounceFilterChange(newFilters);
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: Date | null
  ) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    debounceFilterChange(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...localFilters, status: value };
    setLocalFilters(newFilters);
    debounceFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: any = {
      numero: "",
      startDate: null,
      endDate: null,
      orderId: "",
      ecommerceNumber: "",
      status: "",
    };
    setLocalFilters(clearedFilters);
    debounceFilterChange(clearedFilters);
  };

  const handleSubmitFilters = () => {
    const newFilters = { ...localFilters, ["uuid"]: Math.random() };
    setLocalFilters(newFilters);
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

        <Select
          onValueChange={handleStatusChange}
          value={localFilters.status || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={"todos"} value={"Selecione o status"}>
              {"Selecione o status"}
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
        <Button onClick={handleClearFilters}>Limpar Filtros</Button>
        <Button onClick={handleSubmitFilters} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
