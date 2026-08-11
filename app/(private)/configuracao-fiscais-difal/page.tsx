"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  getTaxFigures,
  createTaxFigure,
  updateTaxFigure,
  deleteTaxFigure,
} from "@/actions/taxFigureAction";
import type { TaxFigure } from "@/types/TaxFigureTypes";

const formSchema = z.object({
  uf: z
    .string()
    .min(1, "UF é obrigatória")
    .transform((v) => v.trim().toUpperCase()),
  cod_st_nac: z.coerce.number().int("Código ST NAC deve ser inteiro"),
  cod_st_imp: z.coerce.number().int("Código ST IMP deve ser inteiro"),
});

type FormData = z.infer<typeof formSchema>;

export default function ConfiguracaoFiscaisDifalPage() {
  const [items, setItems] = useState<TaxFigure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TaxFigure | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const EMPTY_FORM: FormData = {
    uf: "",
    cod_st_nac: 0,
    cod_st_imp: 0,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTaxFigures();
      setItems(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const result = selectedItem
        ? await updateTaxFigure(selectedItem.id, data)
        : await createTaxFigure(data);

      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        form.reset(EMPTY_FORM);
        setSelectedItem(null);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTaxFigure(id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao excluir configuração");
    }
  };

  const handleEdit = (item: TaxFigure) => {
    setSelectedItem(item);
    form.reset({
      uf: item.uf,
      cod_st_nac: item.cod_st_nac,
      cod_st_imp: item.cod_st_imp,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    form.reset(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações Fiscais DIFAL</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações fiscais DIFAL por UF (Códigos ST NAC /
            IMP).
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Configuração
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Cadastradas</CardTitle>
          <CardDescription>
            Lista das configurações fiscais do tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UF</TableHead>
                  <TableHead>Cód. ST NAC</TableHead>
                  <TableHead>Cód. ST IMP</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.uf}</TableCell>
                    <TableCell>{item.cod_st_nac}</TableCell>
                    <TableCell>{item.cod_st_imp}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Deseja
                                realmente excluir a configuração da UF{" "}
                                {item.uf}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma configuração encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar Configuração" : "Nova Configuração"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "Edite os dados da configuração fiscal"
                : "Preencha os dados para criar uma nova configuração fiscal"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex.: SP"
                        maxLength={2}
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cod_st_nac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód. ST NAC</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cod_st_imp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód. ST IMP</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedItem ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
