"use server";
import { TMongo } from "@/infra/mongoClient";
import * as xlsx from "xlsx";

const tmp_arquivo_custokits = "tmp_arquivo_custokits";

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    processedRows: number;
    validRows: number;
    invalidRows: number;
    errors: string[];
  };
}

export async function processarArquivoCustoKits(
  formData: FormData,
  id_tenant: number
): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        message: "Nenhum arquivo foi enviado",
      };
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return {
        success: false,
        message: "Apenas arquivos Excel (.xlsx, .xls) são permitidos",
      };
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ler arquivo Excel
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return {
        success: false,
        message: "O arquivo está vazio ou não contém dados válidos",
      };
    }

    // Validar colunas obrigatórias
    const firstRow = data[0] as Record<string, any>;
    const columns = Object.keys(firstRow).map((col) =>
      col.toLowerCase().trim()
    );

    const hasCodProd = columns.some((col) =>
      col.replace(/\s+/g, "").includes("codprod")
    );
    const hasDescricao = columns.some((col) =>
      col.replace(/\s+/g, "").includes("descricao")
    );
    const hasValor = columns.some((col) =>
      col.replace(/\s+/g, "").includes("valor")
    );

    if (!hasCodProd) {
      return {
        success: false,
        message: "Coluna 'Cod Prod' ou 'Codprod' não encontrada no arquivo",
      };
    }

    if (!hasDescricao) {
      return {
        success: false,
        message: "Coluna 'Descricao' não encontrada no arquivo",
      };
    }

    if (!hasValor) {
      return {
        success: false,
        message: "Coluna 'Valor' não encontrada no arquivo",
      };
    }

    // Encontrar nomes exatos das colunas
    const originalColumns = Object.keys(firstRow);
    const codProdCol = originalColumns.find((col) =>
      col.toLowerCase().replace(/\s+/g, "").includes("codprod")
    );
    const descricaoCol = originalColumns.find((col) =>
      col.toLowerCase().replace(/\s+/g, "").includes("descricao")
    );
    const valorCol = originalColumns.find((col) =>
      col.toLowerCase().replace(/\s+/g, "").includes("valor")
    );

    // Processar dados
    const validRows: any[] = [];
    const errors: string[] = [];
    let processedRows = 0;

    for (const row of data) {
      processedRows++;
      const rowData = row as Record<string, any>;

      const codProd = rowData[codProdCol!];
      const descricao = rowData[descricaoCol!];
      const valor = rowData[valorCol!];

      // Validar campos obrigatórios
      if (
        !codProd ||
        !descricao ||
        valor === undefined ||
        valor === null ||
        valor === ""
      ) {
        errors.push(
          `Linha ${processedRows}: Campos obrigatórios ausentes ou vazios`
        );
        continue;
      }

      // Validar se valor é numérico
      const valorNumerico = parseFloat(String(valor).replace(",", "."));
      if (isNaN(valorNumerico)) {
        errors.push(
          `Linha ${processedRows}: Valor '${valor}' não é um número válido`
        );
        continue;
      }

      // Arredondar para 2 casas decimais
      const valorArredondado = Math.round(valorNumerico * 100) / 100;

      validRows.push({
        codprod: String(codProd).trim(),
        descricao: String(descricao).trim(),
        valor: valorArredondado,
        id_tenant: parseInt(String(id_tenant), 10),
        created_at: new Date(),
        original_row: processedRows,
      });
    }

    // Salvar no MongoDB se houver dados válidos
    if (validRows.length > 0) {
      const { client, clientdb } = await TMongo.connectToDatabase();

      // Limpar dados anteriores do mesmo tenant
      await clientdb
        .collection(tmp_arquivo_custokits)
        .deleteMany({ id_tenant });

      // Inserir novos dados
      await clientdb.collection(tmp_arquivo_custokits).insertMany(validRows);

      await TMongo.mongoDisconnect(client);
    }

    return {
      success: true,
      message: `Arquivo processado com sucesso! ${validRows.length} linhas válidas de ${processedRows} processadas.`,
      data: {
        processedRows,
        validRows: validRows.length,
        invalidRows: processedRows - validRows.length,
        errors,
      },
    };
  } catch (error) {
    console.error("Erro ao processar arquivo:", error);
    return {
      success: false,
      message: "Erro interno ao processar arquivo. Tente novamente.",
    };
  }
}
