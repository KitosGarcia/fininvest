// src/services/generateReceiptService.ts
// --------------------------------------
// Serviço simples para gerar (ou buscar) o PDF de recibo
// a partir do endpoint  POST /contribution-payments/:payment_id/receipt
//
// Uso:
//   import { generateReceipt } from "@/services/generateReceiptService";
//   await generateReceipt(paymentId);
//
// A função faz download automático do PDF e devolve `true` se tudo correr bem.

import api from "../services/api";

/**
 * Gera (caso ainda não exista) e faz o download do recibo em PDF
 * @param paymentId ID do pagamento
 */
export async function generateReceipt(paymentId: number): Promise<boolean> {
  try {
    const { data } = await api.post(
      `/contribution-payments/${paymentId}/receipt`,
      {},
      { responseType: "blob" }
    );

    // Cria URL temporária para o blob
    const blob = new Blob([data], { type: "application/pdf" });
    const url  = window.URL.createObjectURL(blob);

    // Dispara o download
    const link = document.createElement("a");
    link.href        = url;
    link.download    = `recibo_${paymentId}.pdf`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Limpeza
    window.URL.revokeObjectURL(url);
    link.remove();
    return true;
  } catch (err) {
    console.error("Erro ao gerar ou baixar recibo:", err);
    return false;
  }
}

export default { generateReceipt };
