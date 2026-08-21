"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { getProdutosKitRelatorio } from "@/actions/produtoKitRelatorioAction";
import { reportToExcel } from "@/lib/reportToExcel";

const columns = [
  { header: "Código", key: "codigo" },
  { header: "Custo Total Kit", key: "custo_total_kit" },
  { header: "Venda Total Kit", key: "venda_total_kit" },
  { header: "Origem Kit", key: "origem_kit" },
];

export default function RelatorioProdutosKitPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getProdutosKitRelatorio();

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      reportToExcel({
        data: result.data,
        columns,
        sheetName: "Produtos Kit",
        fileName: "relatorio-produtos-kit",
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
            Relatório de Produtos Kit
          </CardTitle>
          <CardDescription>
            Exporta em Excel os produtos kit do tenant logado, com código,
            custo total e venda total do kit.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handleExport}
            disabled={isExporting}
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
