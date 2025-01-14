import OrderList from "./OrderList";

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Pedidos no ecommerce</h1>
      <OrderList />
    </div>
  );
}
