import sys
import os
from fpdf import FPDF
from datetime import datetime

# Ensure the script can find fpdf library (adjust path if necessary)
# sys.path.append('/path/to/your/python/site-packages') 

class PDFReceipt(FPDF):
    def header(self):
        # Add font supporting basic characters + Euro symbol if needed
        # Using built-in font for simplicity now, consider NotoSansCJK for broader support
        self.set_font("Helvetica", "B", 15)
        # Calculate width of title and position
        title_w = self.get_string_width("Recibo de Pagamento de Quota") + 6
        doc_w = self.w
        self.set_x((doc_w - title_w) / 2)
        # Colors of frame, background and text
        # self.set_draw_color(0, 80, 180)
        # self.set_fill_color(230, 230, 0)
        # self.set_text_color(220, 50, 50)
        # Thickness of frame (border)
        # self.set_line_width(1)
        # Title
        self.cell(title_w, 10, "Recibo de Pagamento de Quota", border=0, ln=1, align="C", fill=0)
        # Line break
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")
        self.cell(0, 10, "Fininvest - Gestão de Microcrédito", align="R")

    def chapter_title(self, title):
        self.set_font("Helvetica", "B", 12)
        # self.set_fill_color(200, 220, 255)
        self.cell(0, 6, title, ln=1, fill=0, align="L")
        self.ln(4)

    def chapter_body(self, data):
        self.set_font("Helvetica", "", 11)
        for key, value in data.items():
             self.multi_cell(0, 7, f"{key}: {value}", ln=1)
        self.ln()

    def print_receipt(self, receipt_data):
        self.add_page()
        self.chapter_title("Detalhes do Pagamento")
        self.chapter_body(receipt_data)

def generate_pdf(output_path, receipt_data):
    pdf = PDFReceipt()
    pdf.set_title(f"Recibo Quota {receipt_data.get("Mês/Ano", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_receipt(receipt_data)
    pdf.output(output_path)
    print(f"PDF receipt generated successfully at: {output_path}")

if __name__ == "__main__":
    # Example Usage: Called from Node.js via child_process
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
        # Expecting data as subsequent arguments (key1 value1 key2 value2 ...)
        # This is a simple way, JSON via stdin might be more robust
        data = {}
        i = 2
        while i < len(sys.argv) - 1:
            key = sys.argv[i].replace("_", " ") # Replace underscores with spaces for keys
            value = sys.argv[i+1]
            data[key] = value
            i += 2
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, data)
    else:
        print("Usage: python generate_receipt.py <output_path> [key1 value1 key2 value2 ...]")
        # Example default generation for testing
        test_data = {
            "Recibo Nº": "Q202505-001",
            "Data Pagamento": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Sócio": "Nome Exemplo Sócio",
            "Referente a": "Quota Mensal",
            "Mês/Ano": "Maio/2025",
            "Valor Pago": "100.00 EUR",
            "Método Pagamento": "Transferência Bancária"
        }
        test_output = "/home/lb/documentos/receipt_example.pdf"
        generate_pdf(test_output, test_data)

