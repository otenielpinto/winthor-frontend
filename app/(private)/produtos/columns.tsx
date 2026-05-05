"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/types/ProductTypes";

function formatCurrency(value: number | null): string {
  if (value == null) return "-";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "gtin",
    header: "GTIN",
    cell: ({ row }) => {
      const gtin = row.getValue("gtin") as string | null;
      return gtin ?? "-";
    },
  },
  {
    accessorKey: "preco",
    header: "Preço",
    cell: ({ row }) => {
      const preco = row.getValue("preco") as number;
      return formatCurrency(preco);
    },
  },
  {
    accessorKey: "unidade",
    header: "Unidade",
  },
];
