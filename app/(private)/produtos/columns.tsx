"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/types/ProductTypes";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Button variant="ghost" size="icon" asChild title="Ficha Técnica">
          <Link href={`/produtos/${product.id}/ficha-tecnica`}>
            <ClipboardList className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];
