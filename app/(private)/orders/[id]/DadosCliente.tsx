import React from "react";
import { Input } from "@/components/ui/input";

type DadosClienteProps = {
  cliente: {
    nome: string;
    cpf_cnpj: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  cep: string;
  onCepChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const DadosCliente: React.FC<DadosClienteProps> = ({
  cliente,
  cep,
  onCepChange,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">Dados do Cliente</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <p className="font-medium">Nome:</p>
          <p>{cliente.nome}</p>
        </div>
        <div>
          <p className="font-medium">CPF/CNPJ:</p>
          <p>{cliente.cpf_cnpj}</p>
        </div>
        <div>
          <p className="font-medium">CEP:</p>
          <p>{cliente.cep}</p>
          <Input
            type="text"
            value={cep}
            onChange={onCepChange}
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <p className="font-medium">Endereço:</p>
          <p>{`${cliente.endereco}, ${cliente.numero}`}</p>
        </div>
        <div>
          <p className="font-medium">Complemento:</p>
          <p>{cliente.complemento}</p>
        </div>
        <div>
          <p className="font-medium">Bairro:</p>
          <p>{cliente.bairro}</p>
        </div>
        <div>
          <p className="font-medium">Cidade:</p>
          <p>{cliente.cidade}</p>
        </div>
        <div>
          <p className="font-medium">UF:</p>
          <p>{cliente.uf}</p>
        </div>
      </div>
    </div>
  );
};
