import ProductList from "./ProductList";

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Produtos</h1>
      <ProductList />
    </div>
  );
}
