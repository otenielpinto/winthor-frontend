"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type FaltaEstoqueItem = {
  _id?: string;
  id?: string;
  id_tenant: number;
  codigo: string;
  createdat?: Date;
  descricao: string;
  id_produto: string;
  quantidade: string;
  unidade: string;
  updatedat?: Date;
  valor_unitario: string;
};

export const columns: ColumnDef<FaltaEstoqueItem>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("codigo")}</div>
    ),
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("descricao")}>
        {row.getValue("descricao")}
      </div>
    ),
  },
  {
    accessorKey: "id_produto",
    header: "ID Produto",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("id_produto")}</div>
    ),
  },
  {
    accessorKey: "quantidade",
    header: "Quantidade",
    cell: ({ row }) => {
      const quantidade = parseFloat(row.getValue("quantidade"));
      const unidade = row.original.unidade;
      return (
        <div className="text-right">
          <Badge variant={quantidade > 0 ? "destructive" : "secondary"}>
            {quantidade} {unidade}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "valor_unitario",
    header: "Valor Unitário",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor_unitario"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdat",
    header: "Data Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdat") as Date;
      return (
        <div className="text-sm text-muted-foreground">
          {date ? format(new Date(date), "dd/MM/yyyy HH:mm") : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item?.codigo || "")}
            >
              Copiar Código
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(item?.id_produto || "")
              }
            >
              Copiar ID Produto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
