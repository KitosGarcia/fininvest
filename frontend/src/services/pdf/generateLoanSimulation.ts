import api from "../../services/api";
import { saveAs } from 'file-saver';

export const generateLoanSimulationPdf = async (loanId: number) => {
  try {
    const response = await api.get(`/loans/${loanId}/simulation-pdf`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    saveAs(blob, `Simulacao_Emprestimo_${loanId}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF da simulação:', error);
    throw error;
  }
};
