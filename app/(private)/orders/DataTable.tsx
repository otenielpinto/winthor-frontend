"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Windowed Pagination: retorna array de números de página e "..." onde há saltos
// Ex: buildPageWindow(5, 15, 2) → [1, "...", 4, 5, 6, "...", 15]
function buildPageWindow(
  current: number,
  total: number,
  delta = 2,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);

  if (left > 2) pages.push("...");

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 1) pages.push("...");

  if (total > 1) pages.push(total);

  return pages;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Paginação server-side (opcional — quando ausente usa paginação client-side)
  total?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const isServerPaginated = onPageChange !== undefined;

  // Estado de paginação para o modo server-side
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: (currentPage ?? 1) - 1,
    pageSize: pageSize ?? 50,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Usa paginação server-side quando onPageChange for fornecido
    ...(isServerPaginated
      ? {
          manualPagination: true,
          pageCount: totalPages ?? -1,
          onPaginationChange: (updater) => {
            const next =
              typeof updater === "function" ? updater(pagination) : updater;
            setPagination(next);
            onPageChange(next.pageIndex + 1);
          },
          state: { sorting, pagination },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          state: { sorting },
        }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  const activePage = isServerPaginated
    ? (currentPage ?? 1)
    : table.getState().pagination.pageIndex + 1;
  const activePageCount = isServerPaginated
    ? (totalPages ?? 1)
    : table.getPageCount();
  const activeTotal = isServerPaginated ? total : data.length;

  return (
    <div className="pb-20">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Total: <strong>{activeTotal ?? 0}</strong> registro
          {(activeTotal ?? 0) !== 1 ? "s" : ""}
          {isServerPaginated && activePageCount > 1 && (
            <>
              {" "}
              &mdash; Página <strong>{activePage}</strong> de{" "}
              <strong>{activePageCount}</strong>
            </>
          )}
        </span>

        {activePageCount > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              {/* Anterior */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    !isLoading &&
                    table.getCanPreviousPage() &&
                    table.previousPage()
                  }
                  aria-disabled={!table.getCanPreviousPage() || isLoading}
                  className={
                    !table.getCanPreviousPage() || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {isLoading && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                </PaginationPrevious>
              </PaginationItem>

              {/* Números com ellipsis */}
              {buildPageWindow(activePage, activePageCount).map((item, idx) =>
                item === "..." ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === activePage}
                      onClick={() => !isLoading && onPageChange?.(item)}
                      className={
                        isLoading
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              {/* Próxima */}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    !isLoading && table.getCanNextPage() && table.nextPage()
                  }
                  aria-disabled={!table.getCanNextPage() || isLoading}
                  className={
                    !table.getCanNextPage() || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {isLoading && (
                    <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                  )}
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
