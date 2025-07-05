const PdfPrinter = require("pdfmake");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const numeroPorExtenso = require("numero-por-extenso");

const fmtKz = (n) =>
  Number(n)
    .toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\./g, " ");

const fonts = {
  Roboto: {
    normal:  path.resolve("assets/fonts/Roboto-Regular.ttf"),
    bold:    path.resolve("assets/fonts/Roboto-Bold.ttf"),
    italics: path.resolve("assets/fonts/Roboto-Italic.ttf"),
    bolditalics: path.resolve("assets/fonts/Roboto-BoldItalic.ttf")
  }
};

const printer = new PdfPrinter(fonts);

function valorPorExtenso(valor) {
  return numeroPorExtenso
    .porExtenso(valor, numeroPorExtenso.estilo.monetario)
    .replace(/reais?/gi, "kwanzas")
    .replace(/centavos?/gi, "cêntimos");
}

const generateLoanSimulationPdf = async ({ loan, installments, company }) => {
  const dd = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content: [
      // Cabeçalho
      {
        columns: [
          [
            { text: company.name, style: "companyName" },
            company.nif && { text: `NIF: ${company.nif}`, style: "companyInfo" },
            company.address && { text: company.address, style: "companyInfo" },
            company.phone && { text: `Tel: ${company.phone}`, style: "companyInfo" },
            company.email && { text: company.email, style: "companyInfo" },
            company.website && { text: company.website, style: "companyInfo" },
          ].filter(Boolean),
        ],
      },

      { text: "\n" },

      // Título
      { text: "SIMULAÇÃO DE EMPRÉSTIMO", style: "header" },

      {
        style: "detailsTable",
        table: {
          widths: ["*", "*"],
          body: [
            ["Cliente:", loan.client_name],
            ["Data de Pedido:", dayjs(loan.application_date).format("DD/MM/YYYY")],
            ["Valor Solicitado:", fmtKz(loan.amount_requested) + " Kz"],
            ["Taxa de Juro:", `${parseFloat(loan.interest_rate).toFixed(2)} %`],
            ["Prazo:", `${loan.repayment_term_months} meses`],
            ["Finalidade:", loan.loan_purpose || "—"],
            ["Valor por extenso:", valorPorExtenso(loan.amount_requested)],
          ],
        },
        layout: "noBorders",
        margin: [0, 10, 0, 20],
      },

      // Prestações
      installments && installments.length > 0
        ? {
            style: "zebra",
            table: {
              headerRows: 1,
              widths: ["auto", "*", "*"],
              body: [
                [
                  { text: "#", style: "thead" },
                  { text: "Valor", style: "thead" },
                  { text: "Data de Vencimento", style: "thead" },
                ],
                ...installments.map((i, idx) => [
                  idx + 1,
                  `${fmtKz(i.amount)} Kz`,
                  dayjs(i.due_date).format("DD/MM/YYYY"),
                ]),
              ],
            },
            layout: {
              fillColor: (rowIndex) => (rowIndex % 2 === 0 ? null : "#f9f9f9")
            },
            margin: [0, 0, 0, 20]
          }
        : {
            text: "Este empréstimo tem pagamento único e não possui prestações.",
            italics: true,
            margin: [0, 0, 0, 20]
          },

      // Condições
      {
        text: "Condições Gerais da Simulação",
        style: "subheader",
        margin: [0, 10, 0, 6]
      },
      {
        ul: [
          "A presente simulação é meramente informativa e não representa um contrato vinculativo.",
          "As taxas aplicadas podem variar conforme a análise de crédito e a política interna do fundo.",
          "A aprovação final está sujeita à entrega de documentação completa e assinatura de contrato.",
          "Em caso de atraso, podem ser aplicadas penalizações ou encargos adicionais conforme regulamento.",
        ],
        fontSize: 9,
        margin: [0, 0, 0, 30]
      },

      // Rodapé
      { text: "\n\nAssinatura _______________________________", alignment: "right" },
      {
        text: `Gerado em: ${dayjs().format("DD/MM/YYYY HH:mm")}`,
        style: "footer",
        alignment: "right",
        margin: [0, 8, 0, 0],
      },
    ],

    styles: {
      companyName: { fontSize: 12, bold: true },
      companyInfo: { fontSize: 8, color: "#666" },
      header: { fontSize: 16, bold: true, color: "#003366", margin: [0, 15, 0, 10] },
      subheader: { fontSize: 11, bold: true, color: "#222" },
      thead: { bold: true, fillColor: "#c7d9f1", color: "#000" },
      zebra: { margin: [0, 0, 0, 10] },
      detailsTable: { fontSize: 9 },
      footer: { fontSize: 7, color: "#666" }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(dd);
  const chunks = [];
  pdfDoc.on("data", (chunk) => chunks.push(chunk));
  pdfDoc.end();

  return new Promise((resolve) => {
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

module.exports = {
  generateLoanSimulationPdf
};
