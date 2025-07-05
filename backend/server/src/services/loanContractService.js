// backend/server/src/services/loanContractService.js

const PdfPrinter = require("pdfmake");
const path = require("path");
const { format } = require("date-fns");
const { pt } = require("date-fns/locale");
const numeroPorExtenso = require("numero-por-extenso");

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, "../../assets/fonts/Roboto-Regular.ttf"),
    bold: path.resolve(__dirname, "../../assets/fonts/Roboto-Bold.ttf"),
    italics: path.resolve(__dirname, "../../assets/fonts/Roboto-Italic.ttf"),
    bolditalics: path.resolve(__dirname, "../../assets/fonts/Roboto-BoldItalic.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: pt });
}

function calculateFirstDueDate(disbursementDate) {
  const date = new Date(disbursementDate);
  date.setDate(date.getDate() + 30);
  return formatDate(date.toISOString());
}

function numeroExtenso(valor) {
  return numeroPorExtenso
    .porExtenso(valor, numeroPorExtenso.estilo.monetario)
    .replace(/reais?/gi, "kwanzas")
    .replace(/centavos?/gi, "cêntimos");
}

async function generateLoanContractPdf({ loan, company }) {
  const amountRequested = Number(loan.amount_requested);
  const interestRate = Number(loan.interest_rate);
  const totalToRepay = amountRequested * (1 + interestRate / 100);

  const totalExtenso = numeroExtenso(totalToRepay);
  const pedidoExtenso = numeroExtenso(amountRequested);

  const firstInstallmentDate = loan.disbursement_date
    ? calculateFirstDueDate(loan.disbursement_date)
    : "(data a definir)";

  const docDefinition = {
    content: [
      { text: company?.name || "Contrato de Empréstimo", style: "header" },
      { text: "CONTRATO DE MICROCRÉDITO", style: "title" },
      { text: "Entre as partes:" },
      {
        ul: [
          `Credor: ${company?.name || "Fininvest"}`,
          `Mutuário: ${loan.client_name}`,
        ],
        margin: [0, 10, 0, 10],
      },
      {
        text:
          `Pelo presente contrato, o credor concede ao mutuário um microcrédito no valor de ` +
          `Kz ${amountRequested.toFixed(2)} (${pedidoExtenso}), com juros de ${interestRate}%, ` +
          `a ser reembolsado em ${loan.repayment_term_months} meses, em parcelas mensais iguais, com vencimento da primeira parcela em ${firstInstallmentDate}.`,
        margin: [0, 0, 0, 12],
      },
      {
        text:
          `O valor total a ser reembolsado é de Kz ${totalToRepay.toFixed(2)} (${totalExtenso}), salvo quitação antecipada.`,
        margin: [0, 0, 0, 10],
      },
      {
        text: `Cláusulas:`,
        style: "subheader",
        margin: [0, 10, 0, 4],
      },
      {
        ol: [
          "O mutuário compromete-se a efetuar os pagamentos conforme o plano de prestações acordado.",
          "O atraso superior a 15 dias pode incorrer em penalidades e/ou encargos adicionais.",
          "O mutuário pode amortizar o empréstimo antecipadamente sem penalização.",
          "Este contrato é regido por princípios de boa-fé e não substitui instrumentos legais formais.",
          "Quaisquer litígios serão resolvidos de forma informal entre as partes.",
        ],
      },
      {
        text: `
Data do Pedido: ${formatDate(loan.application_date)}
Data da Aprovação: ${formatDate(loan.approval_date)}
Data do Desembolso: ${formatDate(loan.disbursement_date)}
        `,
        margin: [0, 10, 0, 10],
      },
      {
        columns: [
          { text: "________________________\nCredor", alignment: "center" },
          { text: "________________________\nMutuário", alignment: "center" },
        ],
        margin: [0, 30, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      title: {
        fontSize: 12,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
      },
    },
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
    },
  };

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

module.exports = { generateLoanContractPdf };
