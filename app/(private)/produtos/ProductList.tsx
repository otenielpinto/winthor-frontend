"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DataTable } from "../orders/DataTable";
import { columns } from "./columns";
import { getProducts } from "@/actions/produtoAction";
import type { ProductFilters, PaginatedProductResult } from "@/types/ProductTypes";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function ProductList() {
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [page, setPage] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [sku, setSku] = useState("");

  const [filters, setFilters] = useState<ProductFilters>({
    descricao: "",
    sku: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const {
    data: result,
    isLoading,
    isFetching,
    error,
  } = useQuery<PaginatedProductResult>({
    queryKey: ["products", filters, searchTrigger, page, PAGE_SIZE],
    queryFn: () => getProducts({ ...filters, page, pageSize: PAGE_SIZE }),
    enabled: searchTrigger > 0,
    placeholderData: keepPreviousData,
  });

  const handleSearch = () => {
    const newFilters: ProductFilters = {
      descricao,
      sku,
      page: 1,
      pageSize: PAGE_SIZE,
    };
    setFilters(newFilters);
    setPage(1);
    setHasSearched(true);
    setSearchTrigger((prev) => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setPage(newPage);
    setFilters((prev) => ({ ...prev, page: newPage }));
    setSearchTrigger((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        Erro ao carregar produtos: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Descrição</label>
          <Input
            placeholder="Buscar por descrição..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <div className="w-48">
          <label className="text-sm font-medium mb-1 block">SKU</label>
          <Input
            placeholder="Buscar por SKU..."
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <Button onClick={handleSearch} disabled={isFetching}>
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Search className="h-4 w-4 mr-1" />
          )}
          Enviar
        </Button>
      </div>

      {isLoading && !result ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Carregando...
        </div>
      ) : hasSearched ? (
        <DataTable
          columns={columns}
          data={result?.data ?? []}
          total={result?.total}
          currentPage={result?.page}
          pageSize={result?.pageSize}
          totalPages={result?.totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          Informe a descrição e/ou SKU e clique em &quot;Enviar&quot; para
          buscar os produtos
        </div>
      )}
    </div>
  );
}
