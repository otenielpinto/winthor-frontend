import React from "react";

type CheckoutDetailsProps = {
  checkout: {
    chave_acesso: string;
    checkout_data: string;
    checkout_status: string;
    checkout_user: string;
  };
};

export const CheckoutDetails: React.FC<CheckoutDetailsProps> = ({
  checkout,
}) => {
  // Function to get status display and badge variant
  const getStatusDisplay = (status: string) => {
    if (status === "0") {
      return { label: "Pendente", variant: "secondary" as const };
    } else if (status === "1") {
      return { label: "Processado", variant: "default" as const };
    } else {
      return { label: status || "N/A", variant: "outline" as const };
    }
  };

  const statusInfo = getStatusDisplay(String(checkout?.checkout_status));

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">Dados do Checkout</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <p className="font-medium">Chave de Acesso:</p>
          <p className="overflow-hidden text-ellipsis">
            {checkout?.chave_acesso || "N/A"}
          </p>
        </div>
        <div>
          <p className="font-medium">Data do Checkout:</p>
          <p>{checkout?.checkout_data || "N/A"}</p>
        </div>
        <div>
          <p className="font-medium">Status do Checkout:</p>
          <div className="flex items-center mt-1">
            <span className="ml-2">{statusInfo.label}</span>
          </div>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Usuário do Checkout:</p>
          <p>{checkout?.checkout_user || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};
