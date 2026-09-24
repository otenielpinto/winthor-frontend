"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  getFiliaisProdutosSimples,
  getProdutosSimplesRelatorio,
} from "@/actions/produtoSimplesRelatorioAction";
import { reportToExcel } from "@/lib/reportToExcel";

const columns = [
  { header: "Código", key: "codprod" },
  { header: "Custo", key: "custo" },
  { header: "Venda", key: "pvenda" },
  { header: "Origem", key: "origmerctrib" },
];

export default function RelatorioProdutosSimplesPage() {
  const [filiais, setFiliais] = useState<string[]>([]);
  const [codfilial, setCodfilial] = useState<string>("");
  const [somenteComCusto, setSomenteComCusto] = useState(true);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadFiliais = async () => {
      try {
        const result = await getFiliaisProdutosSimples();

        if (!result.success || !result.data?.length) {
          toast.error(result.message);
          return;
        }

        setFiliais(result.data);
        // Default: filial 3 (padrão do relatório) quando existir, senão a primeira
        setCodfilial(result.data.includes("3") ? "3" : result.data[0]);
      } catch (error) {
        toast.error("Erro inesperado ao carregar filiais");
      } finally {
        setLoadingFiliais(false);
      }
    };

    loadFiliais();
  }, []);

  const handleExport = async () => {
    if (!codfilial) {
      toast.error("Selecione a filial");
      return;
    }

    setIsExporting(true);
    try {
      const result = await getProdutosSimplesRelatorio({
        codfilial,
        somenteComCusto,
      });

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      reportToExcel({
        data: result.data,
        columns,
        sheetName: "Produtos Simples",
        fileName: "relatorio-produtos-simples",
      });

      toast.success(result.message);
    } catch (error) {
      toast.error("Erro inesperado ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Relatório de Produtos Simples
          </CardTitle>
          <CardDescription>
            Exporta em Excel os preços de produtos do tenant logado, com
            código, custo, venda e origem. Selecione a filial antes de
            exportar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Filial</span>
            {loadingFiliais ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando filiais...
              </div>
            ) : (
              <Select value={codfilial} onValueChange={setCodfilial}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  {filiais.map((filial) => (
                    <SelectItem key={filial} value={filial}>
                      {filial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="somente-com-custo"
              checked={somenteComCusto}
              onCheckedChange={(checked) => setSomenteComCusto(checked === true)}
            />
            <Label htmlFor="somente-com-custo" className="text-sm font-normal">
              Somente produtos com custo maior que zero
            </Label>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting || !codfilial}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
