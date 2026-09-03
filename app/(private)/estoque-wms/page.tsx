import EstoqueWmsList from "./EstoqueWmsList";

export default function EstoqueWmsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Estoque</h1>
      <p className="text-muted-foreground mb-5">
        Informações de Estoque disponível
      </p>
      <EstoqueWmsList />
    </div>
  );
}
