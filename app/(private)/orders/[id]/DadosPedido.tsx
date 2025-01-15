import React from "react";

type DadosPedidoProps = {
  pedido: {
    numero: string;
    numero_ecommerce: string;
    data_pedido: string;
    data_prevista: string;
    situacao: string;
    total_pedido: number;
  };
};

export const DadosPedido: React.FC<DadosPedidoProps> = ({ pedido }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">Dados do Pedido</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="font-medium">Número do Pedido:</p>
          <p>{pedido.numero}</p>
        </div>
        <div>
          <p className="font-medium">Número no E-commerce:</p>
          <p>{pedido.numero_ecommerce}</p>
        </div>
        <div>
          <p className="font-medium">Data do Pedido:</p>
          <p>{pedido.data_pedido}</p>
        </div>
        <div>
          <p className="font-medium">Data Prevista de Entrega:</p>
          <p>{pedido.data_prevista}</p>
        </div>
        <div>
          <p className="font-medium">Situação do Pedido:</p>
          <p>{pedido.situacao}</p>
        </div>
        <div>
          <p className="font-medium">Valor Total do Pedido:</p>
          <p>R$ {pedido.total_pedido}</p>
        </div>
      </div>
    </div>
  );
};
