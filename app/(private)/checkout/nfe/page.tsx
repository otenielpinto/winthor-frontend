"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { checkNfe } from "@/actions/actOrder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const formSchema = z.object({
  chave_acesso: z
    .string()
    .length(44, { message: "A chave de acesso deve ter 44 dígitos" })
    .regex(/^\d+$/, { message: "A chave deve conter apenas números" }),
});

export default function CheckoutNFE() {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [lastReadKey, setLastReadKey] = useState<{
    key: string;
    timestamp: string;
    user: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chave_acesso: "",
    },
  });

  const chaveAcesso = form.watch("chave_acesso");

  // Auto-submit when 44 valid digits are entered
  useEffect(() => {
    const isValid = /^\d{44}$/.test(chaveAcesso);
    if (isValid && !isPending && !showSuccess) {
      form.handleSubmit(onSubmit)();
    }
  }, [chaveAcesso]);

  // Focus on input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Re-focus on input after submission completes
  useEffect(() => {
    if (!isPending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPending]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setShowSuccess(false);
    setShowError(null);

    const formData = new FormData();
    formData.append("chave_acesso", values.chave_acesso);

    startTransition(async () => {
      const result = await checkNfe(formData);

      if (result.success) {
        // Store the last read key information
        if (result.data) {
          const brazilDate = new Date(result.data.checkout_data);
          setLastReadKey({
            key: formatNfeKey(result.data.chave_acesso),
            timestamp: formatDate(brazilDate),
            user: result.data.checkout_user,
          });
        }

        setShowSuccess(true);
        toast({
          title: "Verificação concluída",
          description: result.message,
          variant: "default",
        });

        // Reset the form but don't hide success message immediately
        form.reset();

        // Automatically hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        setShowError(result.error || result.message);
        toast({
          title: "Erro na verificação",
          description: result.error || result.message,
          variant: "destructive",
        });
      }
    });
  }

  function resetForm() {
    form.reset();
    setShowSuccess(false);
    setShowError(null);
    inputRef.current?.focus();
  }

  // Format NFE key with spaces for better readability
  function formatNfeKey(key: string): string {
    return key.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  // Format date in Brazilian format
  function formatDate(date: Date): string {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {lastReadKey && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                Última Chave Lida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-mono text-sm break-all bg-white p-2 rounded border border-blue-100">
                  {lastReadKey.key}
                </div>
                <div className="text-sm text-blue-600 flex flex-wrap justify-between">
                  <span>Processado em: {lastReadKey.timestamp}</span>
                  <span>Usuário: {lastReadKey.user}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Verificação de NFe
            </CardTitle>
            <CardDescription className="text-center">
              Digite a chave de acesso da Nota Fiscal Eletrônica
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Verificação Concluída
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  A chave de acesso da NFE foi verificada com sucesso.
                </AlertDescription>
              </Alert>
            ) : showError ? (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Erro na Verificação
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {showError}
                </AlertDescription>
              </Alert>
            ) : null}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="chave_acesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave de Acesso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite os 44 dígitos da chave de acesso"
                          {...field}
                          className="font-mono text-sm"
                          disabled={isPending}
                          ref={inputRef}
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, "");
                            // Limit to 44 characters
                            field.onChange(value.slice(0, 44));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        A chave de acesso possui 44 dígitos numéricos
                        {chaveAcesso && (
                          <span className="ml-2 text-xs font-medium">
                            {chaveAcesso.length}/44 dígitos
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isPending || chaveAcesso.length !== 44}
                  >
                    {isPending ? "Verificando..." : "Verificar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={resetForm}
                    disabled={isPending}
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Sistema de verificação de Notas Fiscais Eletrônicas
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
