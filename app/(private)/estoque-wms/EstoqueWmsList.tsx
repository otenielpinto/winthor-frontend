"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  FileSpreadsheet,
  Loader2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getEstoqueWms } from "@/actions/estoqueWmsAction";
import type { EstoqueWmsRow } from "@/actions/estoqueWmsAction";
import { reportToExcel } from "@/lib/reportToExcel";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const PAGE_SIZES = [10, 25, 50];

const exportColumns = [
  { header: "Codigo Filial", key: "codfilial" },
  { header: "CodLoja", key: "codfilial" },
  { header: "Codigo Produto", key: "codprod" },
  { header: "Unidade", key: "unidade" },
  { header: "Descricao", key: "descricao" },
  { header: "Disponivel", key: "disponivel" },
  { header: "Danificado", key: "danificado" },
  { header: "Truncado", key: "truncado" },
  { header: "Alocado", key: "alocado" },
  { header: "Valor Total", key: "valorTotal" },
];

export default function EstoqueWmsList() {
  const [draftFilters, setDraftFilters] = useState({
    codfilial: "",
    codprod: "",
  });
  const [filters, setFilters] = useState({ codfilial: "", codprod: "" });
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["estoque-wms", filters, searchTrigger],
    queryFn: () => getEstoqueWms(filters),
    enabled: searchTrigger > 0,
  });

  const rows: EstoqueWmsRow[] =
    data && data.success && data.data ? data.data : [];

  const handleBuscar = () => {
    setFilters(draftFilters);
    setPage(1);
    setSearchTrigger((prev) => prev + 1);
    setHasSearched(true);
  };

  const handleLimpar = () => {
    setDraftFilters({ codfilial: "", codprod: "" });
    setFilters({ codfilial: "", codprod: "" });
    setPage(1);
    setSearchTrigger(0);
    setHasSearched(false);
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    reportToExcel({
      data: rows,
      columns: exportColumns,
      sheetName: "Estoque WMS",
      fileName: "estoque-wms",
    });
    toast.success("Exportação concluída");
  };

  // Totals computed from ALL filtered rows (not just the current page).
  const totals = rows.reduce(
    (acc, row) => {
      acc.disponivel += row.disponivel;
      acc.danificado += row.danificado;
      acc.truncado += row.truncado;
      acc.alocado += row.alocado;
      acc.valorTotal += row.valorTotal;
      return acc;
    },
    { disponivel: 0, danificado: 0, truncado: 0, alocado: 0, valorTotal: 0 }
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-end">
        <Button onClick={handleExport} disabled={isLoading || rows.length === 0}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2">
        <Input
          className="w-[200px]"
          placeholder="Código Filial"
          name="codfilial"
          value={draftFilters.codfilial}
          onChange={(e) =>
            setDraftFilters((prev) => ({ ...prev, codfilial: e.target.value }))
          }
        />
        <Input
          className="w-[200px]"
          placeholder="Código Produto"
          name="codprod"
          value={draftFilters.codprod}
          onChange={(e) =>
            setDraftFilters((prev) => ({ ...prev, codprod: e.target.value }))
          }
        />
        <Button onClick={handleBuscar} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
        <Button onClick={handleLimpar} variant="outline">
          Limpar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Carregando estoque...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          Erro ao carregar estoque: {(error as Error).message}
        </div>
      ) : !hasSearched ? (
        <div className="text-center text-muted-foreground py-8">
          Informe os filtros e clique em &quot;Buscar&quot; para visualizar o
          estoque disponível
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {data?.message ?? "Nenhum produto com estoque encontrado"}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CodLoja</TableHead>
                  <TableHead>Código do produto</TableHead>
                  <TableHead className="text-right">Disponível</TableHead>
                  <TableHead className="text-right">Danificado</TableHead>
                  <TableHead className="text-right">Truncado</TableHead>
                  <TableHead className="text-right">Alocado</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Valor Total
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setReveal((prev) => !prev)}
                        aria-label={
                          reveal ? "Ocultar valores" : "Mostrar valores"
                        }
                      >
                        {reveal ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={`${row.codfilial}-${row.codprod}`}>
                    <TableCell>{row.codfilial}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {row.codprod}
                        {row.unidade ? ` (${row.unidade})` : ""}
                      </div>
                      {row.descricao ? (
                        <div className="text-xs text-muted-foreground">
                          {row.descricao}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(row.disponivel)}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(row.danificado)}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(row.truncado)}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(row.alocado)}
                    </TableCell>
                    <TableCell className="text-right">
                      {reveal ? currencyFormatter.format(row.valorTotal) : "••••••"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell />
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(totals.disponivel)}
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(totals.danificado)}
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(totals.truncado)}
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(totals.alocado)}
                  </TableCell>
                  <TableCell className="text-right">
                    {reveal
                      ? currencyFormatter.format(totals.valorTotal)
                      : "••••••"}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Itens por página
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
