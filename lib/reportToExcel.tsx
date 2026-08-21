import xlsx, { IJsonSheet } from "json-as-xlsx";

function aleatorio() {
  return Math.random().toString(36).substr(2, 9);
}

interface IExcelProps {
  data: any[];
  columns: any[];
  sheetName?: string;
  fileName?: string;
}

export function reportToExcel(props: IExcelProps) {
  const {
    data,
    columns,
    sheetName: initialSheetName,
    fileName: initialFileName,
  } = props;

  // Validações básicas
  if (!data || !Array.isArray(data)) {
    console.error("Dados inválidos para exportação");
    return;
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    console.error("Colunas inválidas para exportação");
    return;
  }

  // Validações e formatação de nomes
  let sheetName: string = initialSheetName || "";
  let fileName: string = initialFileName || "";

  if (!sheetName || sheetName.trim() === "") {
    sheetName = "report-" + aleatorio();
  }
  if (!fileName || fileName.trim() === "") {
    fileName = "report-" + aleatorio();
  }

  // Sanitizar nomes para Excel
  sheetName = sheetName.replace(/[\/\\\?\*\[\]]/g, "_").substring(0, 31);
  fileName = fileName.replace(/[\/\\\?\*\[\]<>|:]/g, "_");

  // Transformar as colunas para o formato esperado pela biblioteca
  const formattedColumns = columns.map((col) => {
    if (typeof col === "string") {
      return { label: col, value: col };
    }

    // Se tem header e key (formato do RelatorioExcel)
    if (col.header && col.key) {
      return {
        label: col.header,
        value: col.key,
      };
    }

    // Se já está no formato correto
    if (col.label && col.value) {
      return col;
    }

    // Fallback
    return { label: String(col), value: String(col) };
  });

  // Validar se os dados têm pelo menos as propriedades necessárias
  const validData = data.filter((item) => item && typeof item === "object");

  if (validData.length === 0) {
    console.error("Nenhum dado válido encontrado para exportação");
    return;
  }

  try {
    const jsonSheet: IJsonSheet[] = [
      {
        sheet: sheetName,
        columns: formattedColumns,
        content: validData,
      },
    ];

    const settings = {
      fileName: fileName,
    };

    xlsx(jsonSheet, settings);
  } catch (error) {
    console.error("Erro ao exportar Excel:", error);
    alert(
      "Erro ao gerar o arquivo Excel. Verifique os dados e tente novamente.",
    );
  }
}
