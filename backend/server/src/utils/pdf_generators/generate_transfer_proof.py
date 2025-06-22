import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFTransferProof(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 15)
        title_w = self.get_string_width("Justificativo de Transferência Interna") + 6
        doc_w = self.w
        self.set_x((doc_w - title_w) / 2)
        self.cell(title_w, 10, "Justificativo de Transferência Interna", border=0, ln=1, align="C", fill=0)
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
             # Use multi_cell for potentially long descriptions
             self.set_font("Helvetica", "B", 11)
             self.cell(40, 7, f"{key}:") # Fixed width for key
             self.set_font("Helvetica", "", 11)
             self.multi_cell(0, 7, str(value), ln=1) # Value takes remaining width
        self.ln()

    def print_proof(self, proof_data):
        self.add_page()
        self.chapter_title("Detalhes da Transferência")
        self.chapter_body(proof_data)

def generate_pdf(output_path, proof_data):
    pdf = PDFTransferProof()
    pdf.set_title(f"Justificativo Transferência {proof_data.get("ID Transferência", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_proof(proof_data)
    pdf.output(output_path)
    print(f"PDF transfer proof generated successfully at: {output_path}")

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
        print("Usage: python generate_transfer_proof.py <output_path> [key1 value1 key2 value2 ...]")
        # Example default generation for testing
        test_data = {
            "ID Transferência": "T001",
            "Data Transferência": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Conta Origem": "Conta Principal (ID: 1)",
            "Conta Destino": "Conta Reserva (ID: 2)",
            "Valor": "500.00 EUR",
            "Descrição": "Transferência para reforço de reserva.",
            "Registado por": "Admin User (ID: 1)"
        }
        test_output = "/home/ubuntu/fininvest/transfer_proof_example.pdf"
        generate_pdf(test_output, test_data)

