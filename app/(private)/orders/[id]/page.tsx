"use client";

import React, { useState } from "react";
import { DadosPedido } from "./DadosPedido";
import { DadosCliente } from "./DadosCliente";
import { ItensPedido } from "./ItensPedido";
import { DadosEntrega } from "./DadosEntrega";
import { OutrosDetalhes } from "./OutrosDetalhes";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getOrderBySlug } from "@/actions/actPedidos";
import { Loader2 } from "lucide-react";

// Tipo para o objeto pedido
type Pedido = {
  numero: string;
  numero_ecommerce: string;
  data_pedido: string;
  data_prevista: string;
  situacao: string;
  total_pedido: number;
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
  itens: Array<{
    item: {
      codigo: string;
      descricao: string;
      quantidade: number;
      valor_unitario: number;
    };
  }>;
  endereco_entrega: {
    nome_destinatario: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  marcadores: Array<{
    marcador: {
      descricao: string;
      cor: string;
    };
  }>;
  forma_pagamento: string;
  ecommerce: {
    nomeEcommerce: string;
  };
  nome_transportador: string;
  obs: string;
};

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["ordersById", id],
    queryFn: () => getOrderBySlug(id),
  });

  const [cepCliente, setCepCliente] = useState<string>(
    data?.pedido?.cliente?.cep
  );
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCepCliente(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-24 w-24 animate-spin" /> Carregando...
      </div>
    );
  }

  const handleItemCodigoChange = (index: number, newCodigo: string) => {
    // const newItens = [...data.pedido.itens];
    // newItens[index].item.codigo = newCodigo;
    // setPedido({ ...data.pedido, itens: newItens });
  };

  const handleSave = () => {
    // Validar CEP
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(cepCliente)) {
      toast({
        title: "Erro de validação",
        description: "O formato do CEP é inválido.",
        variant: "destructive",
      });
      return;
    }

    // // Atualizar o pedido com o novo CEP
    // setPedido({
    //   ...pedido,
    //   cliente: {
    //     ...pedido.cliente,
    //     cep: cepCliente,
    //   },
    // });

    toast({
      title: "Sucesso",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleUpdate = () => {
    // Simular uma atualização dos dados
    toast({
      title: "Atualização",
      description: "Os dados do pedido foram atualizados.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Pedido</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DadosPedido pedido={data.pedido} />
        <DadosCliente
          cliente={data?.pedido.cliente}
          cep={cepCliente}
          onCepChange={handleCepChange}
        />
      </div>
      <ItensPedido
        itens={data.pedido.itens}
        onItemCodigoChange={handleItemCodigoChange}
        onItemDelete={() => {}}
        onItemAdd={() => {}}
      />
      <DadosEntrega endereco={data.pedido.endereco_entrega} />
      <OutrosDetalhes
        formaPagamento={data.pedido.forma_pagamento}
        nomeEcommerce={data.pedido.ecommerce.nomeEcommerce}
        nomeTransportador={data.pedido.nome_transportador}
        obs={data.pedido.obs}
        marcadores={data.pedido.marcadores}
      />
      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={handleSave}>Salvar Alterações</Button>
        <Button onClick={handleUpdate} variant="outline">
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
}
