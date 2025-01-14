import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex gap-4 mb-4">
      <Select
        value={filters.period}
        onValueChange={(value) => setFilters({ ...filters, period: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Diario</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensal</SelectItem>
        </SelectContent>
      </Select>

      {/* <Select
        value={filters.status}
        onValueChange={(value) => setFilters({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="Novo">Novo</SelectItem>
          <SelectItem value="Em processamento">Em processamento</SelectItem>
          <SelectItem value="Enviado">Enviado</SelectItem>
          <SelectItem value="Entregue">Entregue</SelectItem>
          <SelectItem value="Cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select> */}
    </div>
  );
}
