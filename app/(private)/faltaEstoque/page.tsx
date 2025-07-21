import FaltaEstoqueList from "./FaltaEstoqueList";

export default function FaltaEstoquePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Produtos em Falta de Estoque</h1>
      <FaltaEstoqueList />
    </div>
  );
}
