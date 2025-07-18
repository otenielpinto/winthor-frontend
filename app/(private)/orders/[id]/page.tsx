"use client";

import React, { useState, useEffect } from "react";
import { DadosPedido } from "./DadosPedido";
import { DadosCliente } from "./DadosCliente";
import { ItensPedido } from "./ItensPedido";
import { DadosEntrega } from "./DadosEntrega";
import { OutrosDetalhes } from "./OutrosDetalhes";
import { CheckoutDetails } from "./CheckoutDetails";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getOrderBySlug } from "@/actions/actPedidos";
import { Loader2 } from "lucide-react";

// Utility function to safely format dates
const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return "";

  // If it's already a string, return it
  if (typeof dateValue === "string") return dateValue;

  // If it's a Date object, format it to string
  try {
    return dateValue instanceof Date
      ? dateValue.toISOString().split("T")[0]
      : "";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Utility function to extract time from date
const extractTime = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return "";

  // If it's a string, try to parse it
  if (typeof dateValue === "string") {
    // Check if the string contains time information
    const timeMatch = dateValue.match(/\d{2}:\d{2}(:\d{2})?/);
    return timeMatch ? timeMatch[0] : "";
  }

  // If it's a Date object, extract time
  try {
    return dateValue instanceof Date
      ? dateValue.toTimeString().split(" ")[0].substring(0, 5) // HH:MM format
      : "";
  } catch (error) {
    console.error("Error extracting time:", error);
    return "";
  }
};

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
  checkout: {
    chave_acesso: string;
    checkout_data: string;
    checkout_status: string;
    checkout_user: string;
  };
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["ordersById", id],
    queryFn: () => getOrderBySlug(id),
  });

  const [cepCliente, setCepCliente] = useState<string>("");
  const [checkoutData, setCheckoutData] = useState({
    chave_acesso: "",
    checkout_data: "",
    checkout_status: "",
    checkout_user: "",
  });

  // Update state when data is loaded
  useEffect(() => {
    if (data?.pedido) {
      setCepCliente(data.pedido.cliente?.cep || "");

      // Initialize checkout data from API response and format date values
      if (data?.chave_acesso) {
        setCheckoutData({
          chave_acesso: data?.chave_acesso || "",
          checkout_data: data?.checkout_data
            ? `${data.checkout_data.toISOString()} `
            : "",
          checkout_status: data?.checkout_status || "",
          checkout_user: data?.checkout_user || "",
        });
      }
    }
  }, [data]);

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
      <CheckoutDetails checkout={checkoutData} />
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
