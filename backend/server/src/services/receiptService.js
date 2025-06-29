/**
 * Geração de recibo em PDF
 * ------------------------
 * buildPDF(paymentId, userId) devolve um Buffer com o PDF
 */


 const PdfPrinter          = require("pdfmake");
 const path                = require("path");
 const fs                  = require("fs");
 const numeroPorExtenso    = require("numero-por-extenso");
 const dayjs               = require("dayjs");
 const paymentRepo         = require("../repositories/paymentRepo");
 const contributionRepo    = require("../repositories/contributionRepo");
 const companyRepo         = require("../repositories/companyRepo"); 
const fmtKz = (n) =>
  Number(n)
    .toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\./g, " ");   // troca ponto (milhar) por espaço

const fonts = {
  Roboto: {
    normal: path.resolve("assets/fonts/Roboto-Regular.ttf"),
    bold:   path.resolve("assets/fonts/Roboto-Bold.ttf"),
  },
};
const printer     = new PdfPrinter(fonts);
const RECEIPT_DIR = path.resolve("uploads", "receipts");

function valorPorExtenso(valor) {
  // Gera text em PT e troca "reais / centavos" por "kwanzas / cêntimos"
  let txt = numeroPorExtenso.porExtenso(valor, numeroPorExtenso.estilo.monetario);
  txt = txt
    .replace(/reais?/gi, "kwanzas")
    .replace(/centavos?/gi, "cêntimos");
  return txt;
}

exports.buildPDF = async (paymentId, requestedBy) => {
  // 1) Carrega pagamento + contribuições saldadas
  const payment = await paymentRepo.findById(paymentId);
if (!payment) throw new Error("Pagamento não encontrado");
const company   = await companyRepo.getProfile();   // { name, nif, … }
const receiptNumber = `RC/${String(paymentId).padStart(6, "0")}`;


  const contribs = await contributionRepo.findSettledByPayment(paymentId);
  const total    = Number(payment.amount);

  // 2) Define conteúdo do PDF
  const dd = {
    pageSize: "A5",
    pageMargins: [40, 60, 40, 60],
    content: [
      // ——— Cabeçalho
      {
        columns: [
         
     
          [
            { text: company.name, style: "companyName" },
            company.nif      && { text: `NIF: ${company.nif}`, style: "companyInfo" },
            company.address  && { text: company.address,        style: "companyInfo" },
            company.phone    && { text: `Tel: ${company.phone}`,style: "companyInfo" },
            company.email    && { text: company.email,          style: "companyInfo" },
            company.website  && { text: company.website,        style: "companyInfo" }
          ].filter(Boolean)
        ]
      },

      { text: "\n" },

      // ——— Título e nº
      {
        columns: [
          { text: "RECIBO DE CONTRIBUIÇÃO", style: "header" },
          { text: `Nº ${receiptNumber}`, alignment: "right", style: "header" }
        ]
      },

      // ——— Dados do pagamento
      {
        style: "detailsTable",
        table: {
          widths: ["*","*"],
          body: [
            ["Sócio:",              payment.member_name],
            ["Data do pagamento:",  dayjs(payment.payment_date).format("DD/MM/YYYY")],
            ["Método:",             payment.method],
            ["Valor total:",         `${fmtKz(payment.amount)} Kz`],
            ["Valor por extenso:",  valorPorExtenso(Number(payment.amount))]
          ]
        },
        layout: "noBorders",
        margin: [0,10,0,20]
      },

      // ——— Contribuições quitadas (tabela zebra)
      { text: "Contribuições quitadas", style: "subheader" },
      {
        style: "zebra",
        table: {
          headerRows: 1,
          widths: ["auto","*","auto","auto"],
          body: [
            [
              { text: "Mês",     style: "thead" },
              { text: "Tipo",    style: "thead" },
              { text: "Valor",   style: "thead" },
              { text: "Estado",  style: "thead" }
            ],
            ...contribs.map(c => [
              dayjs(c.month).format("MMMM YYYY"),
              c.type,
              fmtKz(c.amount),
              c.status
            ])
          ]
        }
      },

      { text: "\n\nAssinatura _______________________________", alignment: "right" },

      // nova linha
{
  text: `Gerado em: ${dayjs().format("DD/MM/YYYY HH:mm")}`,
  style: "footer",
  alignment: "right",
  margin: [0, 8, 0, 0]
}
    ],

    styles: {
      companyName: { fontSize: 12, bold: true },
      companyInfo: { fontSize: 8, color: "#666" },
      header:      { fontSize: 14, bold: true },
      subheader:   { fontSize: 11, bold: true, margin: [0,15,0,5] },
      thead:       { bold: true, fillColor: "#eeeeee" },
      zebra: {
        margin: [0,0,0,5],
        fillColor: null
      },
      detailsTable: { fontSize: 9 },
      footer: { fontSize: 7, color: "#666" }
    }
  };

  // 3) Cria PDF em memória
  const pdfDoc = printer.createPdfKitDocument(dd);
  const chunks = [];
  pdfDoc.on("data", (c) => chunks.push(c));
  pdfDoc.end();

  const pdfBuffer = await new Promise((resolve) =>
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  // 4) Guarda ficheiro e actualiza linha de pagamento
  if (!fs.existsSync(RECEIPT_DIR)) fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  const filename = `receipt_${paymentId}.pdf`;
  fs.writeFileSync(path.join(RECEIPT_DIR, filename), pdfBuffer);

  await paymentRepo.attachReceipt(
    paymentId,
    `/uploads/receipts/${filename}`,
    requestedBy
  );

  return pdfBuffer;
};
