/**
 * Utilitários para manipulação de XML.
 * Compatíveis com uso em componentes cliente e servidor.
 */

/**
 * Converte uma string base64 para XML puro (string UTF-8).
 * Pode ser utilizado em qualquer componente ou formulário (client ou server).
 *
 * @param base64 - String base64 contendo o XML codificado
 * @returns String XML decodificada, ou string vazia se inválida
 *
 * @example
 * const xml = base64ToXml(invoiceXml);
 * console.log(xml); // <?xml version="1.0" encoding="UTF-8"?>...
 */
export function base64ToXml(base64: string): string {
  if (!base64) return "";
  try {
    if (typeof window === "undefined") {
      // Node.js / Next.js server-side
      return Buffer.from(base64, "base64").toString("utf-8");
    }
    // Browser / client-side
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
  } catch {
    return "";
  }
}

/**
 * Inicia o download de um arquivo XML no browser a partir de uma string XML.
 * Deve ser chamada apenas em componentes cliente.
 *
 * @param xmlContent - Conteúdo XML como string
 * @param filename   - Nome do arquivo a ser baixado (padrão: "nota_fiscal.xml")
 *
 * @example
 * downloadXml(xmlContent, `nfe_${orderId}.xml`);
 */
export function downloadXml(
  xmlContent: string,
  filename = "nota_fiscal.xml",
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([xmlContent], {
    type: "application/xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
