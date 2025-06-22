import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFCreditApprovalProof(FPDF):
    def __init__(self, approval_data={}, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.approval_data = approval_data
        self.line_height = 6
        self.body_font_size = 11
        self.footer_text = "Fininvest - Gestão de Microcrédito"

    def header(self):
        self.set_font("Helvetica", "B", 16)
        title = "Comprovativo de Aprovação de Crédito"
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
        self.cell(0, 10, self.footer_text, align="R")

    def add_section_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, title, ln=1, align="L")
        self.ln(2)

    def add_paragraph(self, text):
        self.set_font("Helvetica", "", self.body_font_size)
        self.multi_cell(0, self.line_height, text, align="L")
        self.ln(self.line_height / 2)

    def add_key_value(self, key, value):
        self.set_font("Helvetica", "B", self.body_font_size)
        self.cell(60, self.line_height, f"{key}:") # Wider key cell
        self.set_font("Helvetica", "", self.body_font_size)
        self.multi_cell(0, self.line_height, str(value), ln=1)

    def print_proof(self):
        self.add_page()
        
        # Date
        self.set_font("Helvetica", "", 10)
        self.cell(0, 6, f"Data de Emissão: {self.approval_data.get("data_emissao", datetime.now().strftime("%Y-%m-%d"))}", ln=1, align="R")
        self.ln(5)

        # Recipient Details
        self.add_section_title("Destinatário")
        self.add_key_value("Nome", self.approval_data.get("cliente_nome", "N/A"))
        self.add_key_value("NIF/Doc. ID", self.approval_data.get("cliente_doc", "N/A"))
        self.add_key_value("Morada", self.approval_data.get("cliente_morada", "N/A"))
        self.ln(5)

        # Approval Details
        self.add_section_title("Detalhes da Aprovação do Empréstimo")
        self.add_paragraph(
            f"Exmo(a). Sr(a). {self.approval_data.get("cliente_nome", "")}, temos o prazer de informar que o seu pedido de empréstimo foi aprovado "
            "pelo Fundo Fininvest, nas seguintes condições:"
        )
        self.ln(3)
        self.add_key_value("ID do Empréstimo", self.approval_data.get("loan_id", "N/A"))
        self.add_key_value("Montante Aprovado", f"{self.approval_data.get("valor_aprovado", "0.00")} EUR")
        self.add_key_value("Taxa de Juro Anual Nominal (TAN)", f"{self.approval_data.get("taxa_juro", "0.00")} %")
        self.add_key_value("Prazo de Reembolso", f"{self.approval_data.get("prazo_meses", "0")} meses")
        self.add_key_value("Valor Estimado da Prestação Mensal", f"{self.approval_data.get("valor_prestacao", "N/A")} EUR")
        self.add_key_value("Data de Aprovação", self.approval_data.get("data_aprovacao", "N/A"))
        self.ln(5)

        # Next Steps / Conditions
        self.add_section_title("Próximos Passos")
        self.add_paragraph(
            "Para formalização do empréstimo, será contactado em breve para assinatura do respetivo contrato. "
            "O desembolso do montante aprovado ocorrerá após a assinatura do contrato e cumprimento de eventuais condições adicionais." 
            # Add specific conditions if applicable, e.g.:
            # "Esta aprovação está condicionada à apresentação de [Documento X] e à assinatura do contrato até [Data Limite]."
        )
        self.ln(10)

        # Issuer Signature
        self.add_section_title("Com os melhores cumprimentos,")
        self.ln(15)
        self.set_font("Helvetica", "", self.body_font_size)
        self.cell(0, self.line_height, "_____________________________", ln=1)
        self.cell(0, self.line_height, "A Gerência - Fininvest", ln=1)

def generate_pdf(output_path, approval_data):
    pdf = PDFCreditApprovalProof(approval_data)
    pdf.set_title(f"Comprovativo Aprovação Crédito {approval_data.get("loan_id", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_proof()
    pdf.output(output_path)
    print(f"PDF credit approval proof generated successfully at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        output_filename = sys.argv[1]
        import json
        try:
            approval_data_json = sys.argv[2]
            approval_data = json.loads(approval_data_json)
            if not isinstance(approval_data, dict):
                 raise ValueError("Approval data must be a JSON object.")
        except (IndexError, json.JSONDecodeError, ValueError) as e:
            print(f"Error processing approval data: {e}")
            print("Expected JSON string as 2nd argument: ")
            print(json.dumps({"loan_id": "L005", "cliente_nome": "Cliente X", "valor_aprovado": "5000.00", "..."}))
            sys.exit(1)
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, approval_data)
    else:
        print("Usage: python generate_credit_approval_proof.py <output_path> <json_approval_data>")
        # Example default generation for testing
        test_data = {
            "data_emissao": datetime.now().strftime("%Y-%m-%d"),
            "cliente_nome": "João Silva (Teste)",
            "cliente_doc": "123456789",
            "cliente_morada": "Av. Teste, 456, Porto",
            "loan_id": "L005-Test",
            "valor_aprovado": "5000.00",
            "taxa_juro": "5.50",
            "prazo_meses": "24",
            "valor_prestacao": "220.46", # Example
            "data_aprovacao": "2025-05-23"
        }
        test_output = "/home/ubuntu/fininvest/credit_approval_proof_example.pdf"
        generate_pdf(test_output, test_data)

