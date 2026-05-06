"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ClipboardList,
  AlertTriangle,
  PackageOpen,
  ExternalLink,
} from "lucide-react";
import { getFichaTecnicaProduto } from "@/actions/fichaTecnicaAction";
import type { FichaTecnicaComponent } from "@/types/FichaTecnicaTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDate(value: string | null): string {
  if (!value || typeof value !== "string") return "—";
  try {
    const parsed = parseISO(value);
    if (isNaN(parsed.getTime())) return value;
    return format(parsed, "dd/MM/yyyy");
  } catch {
    return value;
  }
}

/** Redondea a 2 casas decimais para evitar imprecisão de ponto flutuante */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FichaTecnicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const numericId = Number(id);

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ficha-tecnica", numericId],
    queryFn: () => getFichaTecnicaProduto(numericId),
    enabled: !Number.isNaN(numericId) && numericId > 0,
  });

  // --- Invalid ID ---
  if (Number.isNaN(numericId) || numericId <= 0) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ID inválido</AlertTitle>
          <AlertDescription>
            O ID do produto fornecido não é válido.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/produtos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // --- Error ---
  if (isError || !result?.success) {
    const errorMsg =
      result?.message ?? (error as Error)?.message ?? "Erro desconhecido";
    toast.error(errorMsg);
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar ficha técnica</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/produtos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const { product, components, isKit } = result.data!;

  // --- Totals ---
  const { totalCusto, totalVenda } = components.reduce(
    (acc, c) => ({
      totalCusto: round2(acc.totalCusto + c.quantidade * c.precoCusto),
      totalVenda: round2(acc.totalVenda + c.quantidade * c.pvenda),
    }),
    { totalCusto: 0, totalVenda: 0 }
  );

  const margemVenda = round2(
    totalCusto > 0
      ? ((totalVenda - totalCusto) / totalCusto) * 100
      : totalVenda > 0
        ? 100
        : 0
  );

  // --- Full view (kit or simple product) ---
  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/produtos")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ficha Técnica</h1>
          <p className="text-muted-foreground">{product.nome}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {isKit
            ? `Kit — ${components.length} componente${components.length !== 1 ? "s" : ""}`
            : "Produto simples"}
        </Badge>
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Dados do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Nome</span>
            <p className="font-medium">{product.nome}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Código</span>
            <p>
              <a
                href={`https://erp.olist.com/produtos#edit/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                {product.codigo}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Unidade</span>
            <p className="font-medium">{product.unidade}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Preço (Tiny ERP)</span>
            <p className="font-medium">{formatCurrency(product.preco)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalCusto)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preço Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalVenda)}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            margemVenda >= 0
              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
              : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem de Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                margemVenda >= 0
                  ? "text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                  : "text-3xl font-bold text-red-600 dark:text-red-400"
              }
            >
              {formatPercent(margemVenda)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sobre o custo total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Componentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {components.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum componente encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Origem</TableHead>
                  <TableHead className="text-right">Filial</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Dt. Últ. Entrada</TableHead>
                  <TableHead className="text-right">Custo Un.</TableHead>
                  <TableHead className="text-right">Preço Un.</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">Preço Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((c: FichaTecnicaComponent) => (
                  <TableRow key={c.id_produto}>
                    <TableCell className="font-mono text-xs">
                      {c.sku ?? "—"}
                    </TableCell>
                    <TableCell>{c.descricao ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {c.origmerctrib ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.codfilial ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.quantidade}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {formatDate(c.dtultent)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.precoCusto)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.pvenda)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(round2(c.quantidade * c.precoCusto))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(round2(c.quantidade * c.pvenda))}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="border-t-2 font-bold">
                  <TableCell colSpan={6}>Totais</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right text-amber-600 dark:text-amber-400">
                    {formatCurrency(totalCusto)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalVenda)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
