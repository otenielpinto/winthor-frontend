import React from "react";

type MarcadorProps = {
  descricao: string;
  cor: string;
};

export const Marcador: React.FC<MarcadorProps> = ({ descricao, cor }) => {
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cor, color: getContrastColor(cor) }}
    >
      {descricao}
    </span>
  );
};

// Função auxiliar para determinar a cor do texto com base na cor de fundo
function getContrastColor(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
