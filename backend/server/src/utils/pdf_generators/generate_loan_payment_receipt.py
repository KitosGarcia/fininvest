import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFLoanPaymentReceipt(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 15)
        title = "Recibo de Pagamento de Prestação"
        title_w = self.get_string_width(title) + 6
        doc_w = self.w
        self.set_x((doc_w - title_w) / 2)
        self.cell(title_w, 10, title, border=0, ln=1, align="C", fill=0)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")
        self.cell(0, 10, "Fininvest - Gestão de Microcrédito", align="R")

    def chapter_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 6, title, ln=1, fill=0, align="L")
        self.ln(4)

    def chapter_body(self, data):
        self.set_font("Helvetica", "", 11)
        for key, value in data.items():
             self.set_font("Helvetica", "B", 11)
             self.cell(50, 7, f"{key}:") # Fixed width for key
             self.set_font("Helvetica", "", 11)
             self.multi_cell(0, 7, str(value), ln=1) # Value takes remaining width
        self.ln()

    def print_receipt(self, receipt_data):
        self.add_page()
        self.chapter_title("Detalhes do Pagamento da Prestação")
        self.chapter_body(receipt_data)

def generate_pdf(output_path, receipt_data):
    pdf = PDFLoanPaymentReceipt()
    pdf.set_title(f"Recibo Prestação {receipt_data.get("Nº Prestação", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_receipt(receipt_data)
    pdf.output(output_path)
    print(f"PDF loan payment receipt generated successfully at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
        data = {}
        i = 2
        while i < len(sys.argv) - 1:
            key = sys.argv[i].replace("_", " ")
            value = sys.argv[i+1]
            data[key] = value
            i += 2
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, data)
    else:
        print("Usage: python generate_loan_payment_receipt.py <output_path> [key1 value1 key2 value2 ...]")
        # Example default generation for testing
        test_data = {
            "Recibo Nº": "LP202505-001",
            "Data Pagamento": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Cliente": "Nome Exemplo Cliente",
            "Empréstimo ID": "L005",
            "Nº Prestação": "3",
            "Valor Pago": "215.50 EUR",
            "Método Pagamento": "Débito Direto"
        }
        test_output = "/home/ubuntu/fininvest/loan_payment_receipt_example.pdf"
        generate_pdf(test_output, test_data)

