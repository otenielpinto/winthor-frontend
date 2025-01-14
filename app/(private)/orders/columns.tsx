"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from "./orderTypes";
import { deleteOrder } from "@/actions/actPedidos";
import { useTransition } from "react";
import { toast } from "sonner";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Codigo interno",
  },
  {
    accessorKey: "numero",
    header: "Numero do Pedido",
  },

  {
    accessorKey: "numero_ecommerce",
    header: "Numero do Ecommerce",
  },
  {
    accessorKey: "nome_ecommerce",
    header: "Canal de Venda",
  },

  {
    accessorKey: "orderId",
    header: "Codigo Sistema WINTHOR",
  },

  {
    accessorKey: "date",
    header: "Data",
  },

  {
    accessorKey: "nome",
    header: "Nome do Cliente",
  },

  {
    accessorKey: "status_processo",
    header: "Fase",
    meta: {
      isVisible: false,
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusProcesso = row.getValue("status_processo") as number;

      return (
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            statusProcesso
          )}`}
        >
          {status}
        </div>
      );
    },
  },

  {
    accessorKey: "value",
    header: "Valor",
  },

  {
    accessorKey: "region",
    header: "Região",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const order: any = row.original;
      const [isPending, startTransition] = useTransition();

      const handleDelete = async () => {
        startTransition(async () => {
          try {
            const response = await deleteOrder(order.id);
            if (response.success) {
              toast.success(response.message);
              // Refresh the data or update the UI
              window.location.reload();
            } else {
              toast.error(response.message);
            }
          } catch (e) {
            toast.error("Erro ao excluir pedido");
          }
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order?.numero)}
            >
              Copy Nº do Pedido
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function getStatusColor(status: number): string {
  switch (status) {
    case 1:
      return "bg-green-100 text-green-800";
    case 2:
      return "bg-green-100 text-green-800";
    case 3:
      return "bg-blue-100 text-blue-800";
    case 500:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
