// src/services/api/uploadService.ts
import api from "../../services/api";
import toast from "react-hot-toast";

export const uploadReceipt = async (receiptFile: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", receiptFile); // Nome do campo precisa ser exatamente "file"

  try {
    const res = await api.post("/upload", formData); // NÃO definir headers aqui
    return res.data.url;
  } catch (err) {
    toast.error("Erro ao subir comprovativo");
    return null;
  }
};
