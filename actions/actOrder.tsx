"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { subDays, format } from "date-fns";
import { ObjectId } from "mongodb";
import { lib } from "@/lib/lib";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// NFE check validation schema
const checkNfeSchema = z.object({
  chave_acesso: z
    .string()
    .length(44, { message: "A chave de acesso deve ter 44 dígitos" })
    .regex(/^\d+$/, { message: "A chave deve conter apenas números" }),
});

type CheckNfeResult = {
  success: boolean;
  message: string;
  data?: {
    chave_acesso: string;
    checkout_data: string;
    checkout_user: string;
    checkout_status: number;
  };
  error?: string;
};

/**
 * Action to check and register an NFE access key
 * @param formData Form data containing the NFE access key
 * @returns Result of the operation
 */
export async function checkNfe(formData: FormData): Promise<CheckNfeResult> {
  try {
    // Extract and validate the form data
    const validatedFields = checkNfeSchema.safeParse({
      chave_acesso: formData.get("chave_acesso"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Dados inválidos",
        error: validatedFields.error.errors[0].message,
      };
    }

    const { chave_acesso } = validatedFields.data;

    // Get current date for Brazil timezone (GMT-3)
    const now = new Date();
    const brasilDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const checkout_data = brasilDate.toISOString();

    // Get user information
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "AUTH_REQUIRED",
      };
    }

    const checkout_user = String(user?.name || user?.email || "unknown");
    const checkout_status = 1;

    // Connect to MongoDB
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      // Get the collection
      const collection = clientdb.collection("order");

      // Update or insert document
      const result = await collection.updateOne(
        { chave_acesso },
        {
          $set: {
            checkout_data,
            checkout_status,
            checkout_user,
          },
        },
        { upsert: false }
      );

      // Revalidate the page
      revalidatePath("/checkout/nfe");

    // If no document was updated, then the key doesn't exist in the database
    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "Chave de NFE não encontrada",
        error: "NFE_NOT_FOUND",
      };
    }

    return {
      success: true,
      message: "Chave de NFE atualizada com sucesso",
      data: {
        chave_acesso,
        checkout_data,
        checkout_user,
        checkout_status,
      },
    };
    } finally {
      // Always close the MongoDB connection
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error checking NFE:", error);
    return {
      success: false,
      message: "Erro ao verificar a NFE",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
