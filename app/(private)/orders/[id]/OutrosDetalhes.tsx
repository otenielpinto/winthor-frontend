import React from "react";
import { Marcador } from "./Marcador";

type OutrosDetalhesProps = {
  formaPagamento: string;
  nomeEcommerce: string;
  nomeTransportador: string;
  obs: string;
  marcadores: Array<{
    marcador: {
      descricao: string;
      cor: string;
    };
  }>;
};

export const OutrosDetalhes: React.FC<OutrosDetalhesProps> = ({
  formaPagamento,
  nomeEcommerce,
  nomeTransportador,
  obs,
  marcadores,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">Outros Detalhes</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="font-medium">Forma de Pagamento:</p>
          <p>{formaPagamento}</p>
        </div>
        <div>
          <p className="font-medium">Nome do E-commerce:</p>
          <p>{nomeEcommerce}</p>
        </div>
        <div>
          <p className="font-medium">Nome do Transportador:</p>
          <p>{nomeTransportador}</p>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Observações Gerais:</p>
          <p>{obs}</p>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Marcadores:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {marcadores.map((m, index) => (
              <Marcador
                key={index}
                descricao={m.marcador.descricao}
                cor={m.marcador.cor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
