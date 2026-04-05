"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import * as xlsx from "xlsx";

const COLLECTION = "tmp_estoque_conciliar";

const REQUIRED_COLUMNS = ["id", "produto", "código (sku)", "saldo em estoque"];

export interface UploadEstoqueResult {
  success: boolean;
  message: string;
  data?: {
    processedRows: number;
    validRows: number;
    invalidRows: number;
    errors: string[];
  };
}

export async function processarArquivoEstoque(
  formData: FormData
): Promise<UploadEstoqueResult> {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: "Usuário não autenticado",
    };
  }

  const id_tenant = user.id_tenant as number;

  const file = formData.get("file") as File;

  if (!file) {
    return {
      success: false,
      message: "Nenhum arquivo foi enviado",
    };
  }

  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    return {
      success: false,
      message: "Apenas arquivos Excel (.xlsx, .xls) são permitidos",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return {
        success: false,
        message: "O arquivo está vazio ou não contém dados válidos",
      };
    }

    const firstRow = data[0] as Record<string, unknown>;
    const originalColumns = Object.keys(firstRow);
    const normalizedColumns = originalColumns.map((col) =>
      col.toLowerCase().trim()
    );

    for (const required of REQUIRED_COLUMNS) {
      if (!normalizedColumns.includes(required)) {
        return {
          success: false,
          message: `Coluna obrigatória não encontrada: "${required}"`,
        };
      }
    }

    const findCol = (keyword: string) =>
      originalColumns.find(
        (col) => col.toLowerCase().trim() === keyword
      )!;

    const colId = findCol("id");
    const colProduto = findCol("produto");
    const colSku = findCol("código (sku)");
    const colSaldo = findCol("saldo em estoque");

    const validRows: Record<string, unknown>[] = [];
    const errors: string[] = [];
    let processedRows = 0;

    for (const row of data) {
      processedRows++;
      const rowData = row as Record<string, unknown>;

      const id = rowData[colId];
      const produto = rowData[colProduto];
      const codigo_sku = rowData[colSku];
      const saldo_estoque = rowData[colSaldo];

      if (
        id === undefined ||
        id === null ||
        id === "" ||
        produto === undefined ||
        produto === null ||
        produto === "" ||
        codigo_sku === undefined ||
        codigo_sku === null ||
        codigo_sku === "" ||
        saldo_estoque === undefined ||
        saldo_estoque === null ||
        saldo_estoque === ""
      ) {
        errors.push(`Linha ${processedRows}: dados obrigatórios ausentes`);
        continue;
      }

      validRows.push({
        id: String(id),
        produto: String(produto),
        codigo_sku: String(codigo_sku),
        saldo_estoque: Number(saldo_estoque),
        id_tenant,
        created_at: new Date(),
        original_row: processedRows,
      });
    }

    if (validRows.length > 0) {
      const { client, clientdb } = await TMongo.connectToDatabase();

      try {
        await clientdb.collection(COLLECTION).deleteMany({ id_tenant });
        await clientdb.collection(COLLECTION).insertMany(validRows);
      } finally {
        await TMongo.mongoDisconnect(client);
      }
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
    console.error("Erro ao processar arquivo de estoque:", error);
    return {
      success: false,
      message: "Erro interno ao processar arquivo. Tente novamente.",
    };
  }
}
