import React from "react";

type DadosEntregaProps = {
  endereco: {
    nome_destinatario: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
};

export const DadosEntrega: React.FC<DadosEntregaProps> = ({ endereco }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">Dados de Entrega</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <p className="font-medium">Nome do Destinatário:</p>
          <p>{endereco?.nome_destinatario}</p>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Endereço:</p>
          <p>{`${endereco?.endereco}, ${endereco?.numero}`}</p>
        </div>
        <div>
          <p className="font-medium">Complemento:</p>
          <p>{endereco?.complemento}</p>
        </div>
        <div>
          <p className="font-medium">Bairro:</p>
          <p>{endereco?.bairro}</p>
        </div>
        <div>
          <p className="font-medium">Cidade:</p>
          <p>{endereco?.cidade}</p>
        </div>
        <div>
          <p className="font-medium">UF:</p>
          <p>{endereco?.uf}</p>
        </div>
        <div>
          <p className="font-medium">CEP:</p>
          <p>{endereco?.cep}</p>
        </div>
      </div>
    </div>
  );
};
