"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  getEmpresasWms,
  createEmpresaWms,
  updateEmpresaWms,
  deleteEmpresaWms,
  type EmpresaWmsItem,
} from "@/actions/empresaWmsAction";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional().default(""),
});

type FormData = z.infer<typeof formSchema>;

export default function EmpresasPage() {
  const [items, setItems] = useState<EmpresaWmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EmpresaWmsItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", cnpj: "" },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      setItems(await getEmpresasWms());
    } catch {
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("nome", data.nome);
    formData.append("cnpj", data.cnpj || "");

    try {
      const result = selectedItem
        ? await updateEmpresaWms(selectedItem.id, formData)
        : await createEmpresaWms(formData);

      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        form.reset();
        setSelectedItem(null);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao salvar empresa");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteEmpresaWms(id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao excluir empresa");
    }
  };

  const handleEdit = (item: EmpresaWmsItem) => {
    setSelectedItem(item);
    form.reset({ nome: item.nome, cnpj: item.cnpj || "" });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">
            Cadastro de empresas WMS
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.cnpj}</TableCell>
                    <TableCell>{item.id_tenant}</TableCell>
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
                                realmente excluir a empresa {item.nome}?
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
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? `Editando empresa ID ${selectedItem.id}`
                : "O ID é gerado automaticamente"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="CNPJ" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
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
