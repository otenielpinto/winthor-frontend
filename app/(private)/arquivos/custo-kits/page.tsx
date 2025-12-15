"use client";

import { useState, useRef, useEffect } from "react";
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
  processarArquivoCustoKits,
  UploadResult,
} from "@/actions/custokitsAction";
import { getUser } from "@/hooks/useUser";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface User {
  id_tenant: string;
  [key: string]: any;
}

export default function UploadCustoKitsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      console.log("Campos de user:", userData);
      setUser(userData as User);
    };
    fetchUser();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
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

      // Validar tamanho (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setResult({
          success: false,
          message: "O arquivo deve ter no máximo 10MB",
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

    if (!user?.id_tenant) {
      setResult({
        success: false,
        message: "Erro de autenticação. Faça login novamente.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResult = await processarArquivoCustoKits(
        formData,
        parseInt(String(user.id_tenant), 10)
      );

      setResult(uploadResult);

      if (uploadResult.success) {
        // Limpar o formulário em caso de sucesso
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
            Upload de Custo de Kits
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo Excel (.xlsx) com as colunas
            &quot;CodProd&quot;, &quot;Descricao&quot; e &quot;Valor&quot;
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
                Formatos aceitos: .xlsx, .xls (máximo 10MB)
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
                  <AlertDescription
                    className={
                      result.success ? "text-green-800" : "text-red-800"
                    }
                  >
                    {result.message}
                  </AlertDescription>

                  {result.success && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      O arquivo será processado em aproximadamente 10 minutos.
                    </div>
                  )}

                  {result.data && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <strong>Linhas processadas:</strong>{" "}
                        {result.data.processedRows}
                      </p>
                      <p>
                        <strong>Linhas válidas:</strong> {result.data.validRows}
                      </p>
                      {result.data.invalidRows > 0 && (
                        <p>
                          <strong>Linhas inválidas:</strong>{" "}
                          {result.data.invalidRows}
                        </p>
                      )}
                      {result.data.errors.length > 0 && (
                        <div className="mt-2">
                          <p>
                            <strong>Erros encontrados:</strong>
                          </p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {result.data.errors
                              .slice(0, 5)
                              .map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            {result.data.errors.length > 5 && (
                              <li>
                                ... e mais {result.data.errors.length - 5} erros
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Requisitos do arquivo - Colunas obrigatórias:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Arquivo deve estar em formato Excel (.xlsx ou .xls)</li>
              <li>
                • <strong>CodProd</strong> (não diferencia maiúscula/minúscula)
              </li>
              <li>
                • <strong>Descricao</strong> (não diferencia
                maiúscula/minúscula) maiúscula/minúscula)
              </li>
              <li>
                • <strong>Valor</strong> (não diferencia maiúscula/minúscula)
              </li>
              <li>
                • O valor deve ser um número válido (use vírgula ou ponto)
              </li>
              <li>• Tamanho máximo: 10MB</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-900 mb-2">
              Exemplo de formato esperado:
            </h3>
            <div className="bg-white rounded border border-amber-100 p-3 text-xs font-mono overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-2 py-1">CodProd</th>
                    <th className="text-left px-2 py-1">Descricao</th>
                    <th className="text-left px-2 py-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-1">KIT001</td>
                    <td className="px-2 py-1">Kit Produto A</td>
                    <td className="px-2 py-1">150,50</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">KIT002</td>
                    <td className="px-2 py-1">Kit Produto B</td>
                    <td className="px-2 py-1">250.75</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
