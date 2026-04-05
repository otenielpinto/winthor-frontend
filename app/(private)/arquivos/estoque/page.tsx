"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    processedRows: number;
    validRows: number;
    invalidRows: number;
    errors: string[];
  };
}

export default function UploadEstoquePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setResult({
          success: false,
          message: "Apenas arquivos Excel (.xlsx, .xls) são permitidos",
        });
        return;
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
        setResult({
          success: false,
          message: "O arquivo deve ter no máximo 20MB",
        });
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setResult({
        success: false,
        message: "Por favor, selecione um arquivo",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-estoque", {
        method: "POST",
        body: formData,
      });

      const uploadResult: UploadResult = await response.json();
      setResult(uploadResult);

      if (uploadResult.success) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro inesperado ao processar arquivo",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Importação de Estoque
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo Excel (.xlsx) com as colunas
            &quot;ID&quot;, &quot;Produto&quot;, &quot;Código (SKU)&quot; e
            &quot;Saldo em estoque&quot;
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="file-input" className="block text-sm font-medium">
                Selecionar Arquivo Excel
              </label>
              <Input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: .xlsx, .xls (máximo 20MB)
              </p>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!file || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isProcessing ? "Processando..." : "Processar Arquivo"}
              </Button>

              {(file || result) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isProcessing}
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>

          {result && (
            <Alert
              className={
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className="font-medium">
                    {result.message}
                  </AlertDescription>
                  {result.data && result.data.errors.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Erros encontrados:</p>
                      <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                        {result.data.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {result.data.errors.length > 10 && (
                          <li>
                            ...e mais {result.data.errors.length - 10} erros
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
