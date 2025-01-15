import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

type Item = {
  item: {
    codigo: string;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
  };
};

type ItensPedidoProps = {
  itens: Item[];
  onItemCodigoChange: (index: number, newCodigo: string) => void;
  onItemDelete: (index: number) => void;
  onItemAdd: () => void;
};

export const ItensPedido: React.FC<ItensPedidoProps> = ({
  itens,
  onItemCodigoChange,
  onItemDelete,
  onItemAdd,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">Itens do Pedido</h2>
      <Button variant="outline" className="mb-4" onClick={onItemAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Produto
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Valor Unitário</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens?.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="text"
                  value={item?.item.codigo}
                  onChange={(e) => onItemCodigoChange(index, e.target.value)}
                />
              </TableCell>
              <TableCell>{item?.item.descricao}</TableCell>
              <TableCell>{item?.item.quantidade}</TableCell>
              <TableCell>R$ {item?.item.valor_unitario}</TableCell>
              <TableCell>
                R${" "}
                {(item?.item.quantidade * item?.item.valor_unitario).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onItemDelete(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
