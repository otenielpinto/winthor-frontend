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

interface FaltaEstoqueFilters {
  startDate: Date | null;
  endDate: Date | null;
  descricao: string;
  codigo: string;
  id_produto: string;
}

interface FilterSectionProps {
  filters: FaltaEstoqueFilters;
  onFilterChange: (filters: Partial<FaltaEstoqueFilters>) => void;
  isLoading?: boolean;
}

export function FaltaEstoqueFilterSection({
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

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: currentDate,
      endDate: currentDate,
      descricao: "",
      codigo: "",
      id_produto: "",
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
          placeholder="Descrição do produto"
          name="descricao"
          value={localFilters.descricao}
          onChange={handleInputChange}
        />

        <Input
          placeholder="Código do produto"
          name="codigo"
          value={localFilters.codigo}
          onChange={handleInputChange}
        />

        <Input
          placeholder="ID do produto"
          name="id_produto"
          value={localFilters.id_produto}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleClearFilters} variant="outline">
          Limpar Filtros
        </Button>
        <Button onClick={handleSubmitFilters} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
    </div>
  );
}
