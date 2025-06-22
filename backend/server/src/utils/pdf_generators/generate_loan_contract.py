import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFLoanContract(FPDF):
    def __init__(self, contract_data={}, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.contract_data = contract_data
        self.line_height = 5 # Smaller line height for dense text
        self.body_font_size = 10
        self.footer_text = "Fininvest - Gestão de Microcrédito"

    def header(self):
        self.set_font("Helvetica", "B", 16)
        title = "Contrato de Mútuo (Empréstimo)"
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
        self.multi_cell(0, self.line_height, text, align="J") # Justify text
        self.ln(self.line_height / 2)

    def add_key_value(self, key, value):
        self.set_font("Helvetica", "B", self.body_font_size)
        self.cell(50, self.line_height, f"{key}:")
        self.set_font("Helvetica", "", self.body_font_size)
        self.multi_cell(0, self.line_height, str(value), ln=1)

    def print_contract(self):
        self.add_page()
        
        # Parties
        self.add_section_title("Partes Contratantes")
        self.add_key_value("Mutuante (Credor)", self.contract_data.get("mutuante_nome", "Fininvest (Representada)"))
        self.add_key_value("", f"NIF: {self.contract_data.get("mutuante_nif", "N/A")}")
        self.add_key_value("", f"Sede: {self.contract_data.get("mutuante_sede", "N/A")}")
        self.ln(5)
        self.add_key_value("Mutuário (Devedor)", self.contract_data.get("mutuario_nome", "N/A"))
        self.add_key_value("", f"NIF/Doc. ID: {self.contract_data.get("mutuario_doc", "N/A")}")
        self.add_key_value("", f"Morada: {self.contract_data.get("mutuario_morada", "N/A")}")
        self.add_key_value("", f"Email: {self.contract_data.get("mutuario_email", "N/A")}")
        self.ln(5)

        # Loan Details
        self.add_section_title("Objeto do Contrato")
        self.add_paragraph(
            "Pelo presente contrato, o Mutuante concede ao Mutuário, a título de mútuo (empréstimo), "
            "a quantia infra indicada, nos termos e condições seguintes:"
        )
        self.add_key_value("Montante do Empréstimo", f"{self.contract_data.get("valor_aprovado", "0.00")} EUR")
        self.add_key_value("Taxa de Juro Anual Nominal (TAN)", f"{self.contract_data.get("taxa_juro", "0.00")} %")
        self.add_key_value("Prazo de Reembolso", f"{self.contract_data.get("prazo_meses", "0")} meses")
        self.add_key_value("Finalidade Declarada", self.contract_data.get("finalidade", "N/A"))
        self.add_key_value("Data de Aprovação", self.contract_data.get("data_aprovacao", "N/A"))
        self.add_key_value("Data Prev. Desembolso", self.contract_data.get("data_desembolso", "N/A"))
        self.ln(5)

        # Repayment Conditions
        self.add_section_title("Condições de Reembolso")
        self.add_paragraph(
            f"O reembolso do capital e juros será efetuado em {self.contract_data.get("prazo_meses", "0")} prestações mensais, constantes e sucessivas, "
            f"no valor de {self.contract_data.get("valor_prestacao", "N/A")} EUR cada, vencendo-se a primeira em {self.contract_data.get("data_primeira_prestacao", "N/A")} "
            "e as seguintes em igual dia dos meses subsequentes."
        )
        self.add_paragraph(
            "O pagamento será efetuado por [Método de Pagamento - e.g., Débito Direto na conta com IBAN X, Transferência para IBAN Y] até ao dia de vencimento de cada prestação."
        )
        # Add clause about late payments (example)
        self.add_paragraph(
            "Em caso de mora no pagamento de qualquer prestação, serão devidos juros de mora à taxa legal em vigor sobre o montante em dívida, "
            "sem prejuízo do direito do Mutuante de exigir o cumprimento integral do contrato ou a sua resolução."
        )
        self.ln(5)

        # Guarantees (if applicable)
        if self.contract_data.get("garantias"):
            self.add_section_title("Garantias")
            self.add_paragraph(f"Para garantia do bom cumprimento das obrigações assumidas, o Mutuário apresenta as seguintes garantias: {self.contract_data.get("garantias")}")
            self.ln(5)

        # Other Clauses (Placeholders)
        self.add_section_title("Outras Cláusulas")
        self.add_paragraph("1. Comunicações: Todas as comunicações relativas a este contrato deverão ser feitas por escrito para os contactos indicados.")
        self.add_paragraph("2. Lei Aplicável e Foro: O presente contrato rege-se pela lei portuguesa. Para a resolução de quaisquer litígios emergentes, é competente o foro da comarca de [Localidade], com expressa renúncia a qualquer outro.")
        self.add_paragraph("3. Proteção de Dados: Os dados pessoais recolhidos serão tratados pela Fininvest para gestão do contrato, nos termos da legislação aplicável.")
        self.ln(10)

        # Signatures
        self.add_section_title("Assinaturas")
        self.ln(15)
        signature_y = self.get_y()
        doc_w = self.w - self.l_margin - self.r_margin
        col_width = doc_w / 2 - 10 # Width for each signature block with spacing

        self.set_x(self.l_margin)
        self.multi_cell(col_width, self.line_height, "O Mutuante:\n\n_____________________________", align="C")
        
        self.set_y(signature_y) # Reset Y to align horizontally
        self.set_x(self.l_margin + col_width + 20)
        self.multi_cell(col_width, self.line_height, "O Mutuário:\n\n_____________________________", align="C")
        self.ln(5)
        
        self.set_x(self.l_margin)
        self.cell(col_width, self.line_height, f"Data: {self.contract_data.get("data_assinatura", "____/____/______")}", align="C")
        self.set_x(self.l_margin + col_width + 20)
        self.cell(col_width, self.line_height, f"Data: {self.contract_data.get("data_assinatura", "____/____/______")}", align="C")
        self.ln()

def generate_pdf(output_path, contract_data):
    pdf = PDFLoanContract(contract_data)
    pdf.set_title(f"Contrato Empréstimo {contract_data.get("loan_id", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_contract()
    pdf.output(output_path)
    print(f"PDF loan contract generated successfully at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        output_filename = sys.argv[1]
        import json
        try:
            contract_data_json = sys.argv[2]
            contract_data = json.loads(contract_data_json)
            if not isinstance(contract_data, dict):
                 raise ValueError("Contract data must be a JSON object.")
        except (IndexError, json.JSONDecodeError, ValueError) as e:
            print(f"Error processing contract data: {e}")
            print("Expected JSON string as 2nd argument: ")
            print(json.dumps({"loan_id": "L005", "mutuario_nome": "Cliente X", "valor_aprovado": "5000.00", "..."}))
            sys.exit(1)
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, contract_data)
    else:
        print("Usage: python generate_loan_contract.py <output_path> <json_contract_data>")
        # Example default generation for testing
        test_data = {
            "loan_id": "L005-Test",
            "mutuante_nome": "Fininvest Fundo Coletivo",
            "mutuante_nif": "999888777",
            "mutuante_sede": "Rua Exemplo, 123, Lisboa",
            "mutuario_nome": "João Silva (Teste)",
            "mutuario_doc": "123456789",
            "mutuario_morada": "Av. Teste, 456, Porto",
            "mutuario_email": "joao.teste@example.com",
            "valor_aprovado": "5000.00",
            "taxa_juro": "5.50",
            "prazo_meses": "24",
            "finalidade": "Renovação da cozinha",
            "data_aprovacao": "2025-05-23",
            "data_desembolso": "2025-05-24",
            "valor_prestacao": "220.46", # Example, should be calculated
            "data_primeira_prestacao": "2025-06-24",
            "garantias": "Nenhuma específica.",
            "data_assinatura": "____/____/______"
        }
        test_output = "/home/ubuntu/fininvest/loan_contract_example.pdf"
        generate_pdf(test_output, test_data)

