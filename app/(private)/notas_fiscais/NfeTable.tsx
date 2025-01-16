import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NfeTable({ data }: any) {
  if (!data || !data) return null;
  let qtd = data?.length || 0;
  let sumOfValor = data.reduce(
    (acc: number, order: any) => acc + order.value,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`Notas Fiscais (${qtd})  --> R$ ${sumOfValor.toFixed(
          2
        )}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Canal de Venda</TableHead>
              <TableHead>Numero ecommerce</TableHead>
              <TableHead>Codigo Sistema</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Região</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/orders/${order.slug}`}>
                    <div className="text-blue-600 hover:underline">
                      {order.numero}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{order.nome_ecommerce}</TableCell>
                <TableCell>{order.numero_ecommerce}</TableCell>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.nome}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>R$ {order.value.toFixed(2)}</TableCell>
                <TableCell>{order.region}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
