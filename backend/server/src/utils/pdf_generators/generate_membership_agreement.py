import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFMembershipAgreement(FPDF):
    def __init__(self, member_data={}, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.member_data = member_data
        self.line_height = 5
        self.body_font_size = 10
        self.footer_text = "Fininvest - Gestão de Microcrédito"

    def header(self):
        self.set_font("Helvetica", "B", 16)
        title = "Termo de Adesão ao Fundo"
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
        self.multi_cell(0, self.line_height, text, align="J")
        self.ln(self.line_height / 2)

    def add_key_value(self, key, value):
        self.set_font("Helvetica", "B", self.body_font_size)
        self.cell(50, self.line_height, f"{key}:")
        self.set_font("Helvetica", "", self.body_font_size)
        self.multi_cell(0, self.line_height, str(value), ln=1)

    def print_agreement(self):
        self.add_page()
        
        # Member Details
        self.add_section_title("Dados do Novo Sócio")
        self.add_key_value("Nome Completo", self.member_data.get("nome_completo", "N/A"))
        self.add_key_value("NIF/Doc. ID", self.member_data.get("nif", "N/A"))
        self.add_key_value("Morada", self.member_data.get("morada", "N/A"))
        self.add_key_value("Email", self.member_data.get("email", "N/A"))
        self.add_key_value("Telefone", self.member_data.get("telefone", "N/A"))
        self.add_key_value("Data de Adesão", self.member_data.get("data_adesao", "N/A"))
        self.ln(5)

        # Agreement Clauses (Placeholders - MUST BE REVIEWED LEGALLY)
        self.add_section_title("Declaração e Compromisso")
        self.add_paragraph(
            f"Eu, {self.member_data.get("nome_completo", "[Nome do Sócio]")}, acima identificado, declaro por minha honra que tomei conhecimento "
            "dos Estatutos e Regulamento Interno do Fundo Fininvest (doravante designado Fundo), os quais aceito integralmente e me comprometo a cumprir."
        )
        self.add_paragraph(
            "Declaro ainda que adiro voluntariamente ao Fundo na qualidade de Sócio, comprometendo-me a:"
        )
        self.set_left_margin(self.l_margin + 10)
        self.add_paragraph(
            f"a) Realizar uma contribuição inicial no valor de {self.member_data.get("contribuicao_inicial", "[Valor]")} EUR."
        )
        self.add_paragraph(
            f"b) Pagar pontualmente a quota mensal estabelecida, no valor atual de {self.member_data.get("quota_mensal", "[Valor]")} EUR, ou outro que venha a ser fixado nos termos regulamentares."
        )
        self.add_paragraph(
            "c) Participar ativamente nas atividades e deliberações do Fundo, sempre que possível."
        )
        self.add_paragraph(
            "d) Informar o Fundo sobre quaisquer alterações aos meus dados de contacto."
        )
        self.set_left_margin(self.l_margin) # Reset margin
        self.ln(5)
        
        self.add_paragraph(
            "Tenho conhecimento que a qualidade de sócio confere direitos e deveres, incluindo o acesso a potenciais benefícios como empréstimos em condições favoráveis "
            "e participação nos resultados do Fundo, mas também implica responsabilidade solidária nos termos definidos nos Estatutos."
        )
        self.ln(10)

        # Signatures
        self.add_section_title("Assinaturas")
        self.ln(15)
        signature_y = self.get_y()
        doc_w = self.w - self.l_margin - self.r_margin
        col_width = doc_w / 2 - 10

        self.set_x(self.l_margin)
        self.multi_cell(col_width, self.line_height, "O Novo Sócio:\n\n_____________________________", align="C")
        
        self.set_y(signature_y)
        self.set_x(self.l_margin + col_width + 20)
        self.multi_cell(col_width, self.line_height, "Pela Direção do Fundo:\n\n_____________________________", align="C")
        self.ln(5)
        
        self.set_x(self.l_margin)
        self.cell(col_width, self.line_height, f"Data: {self.member_data.get("data_assinatura", "____/____/______")}", align="C")
        self.set_x(self.l_margin + col_width + 20)
        self.cell(col_width, self.line_height, f"Data: {self.member_data.get("data_assinatura", "____/____/______")}", align="C")
        self.ln()

def generate_pdf(output_path, member_data):
    pdf = PDFMembershipAgreement(member_data)
    pdf.set_title(f"Termo Adesão {member_data.get("nome_completo", "")}")
    pdf.set_author("Fininvest Platform")
    pdf.print_agreement()
    pdf.output(output_path)
    print(f"PDF membership agreement generated successfully at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        output_filename = sys.argv[1]
        import json
        try:
            member_data_json = sys.argv[2]
            member_data = json.loads(member_data_json)
            if not isinstance(member_data, dict):
                 raise ValueError("Member data must be a JSON object.")
        except (IndexError, json.JSONDecodeError, ValueError) as e:
            print(f"Error processing member data: {e}")
            print("Expected JSON string as 2nd argument: ")
            print(json.dumps({"nome_completo": "Maria Teste", "nif": "987654321", "..."}))
            sys.exit(1)
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, member_data)
    else:
        print("Usage: python generate_membership_agreement.py <output_path> <json_member_data>")
        # Example default generation for testing
        test_data = {
            "nome_completo": "Maria Santos (Teste)",
            "nif": "987654321",
            "morada": "Rua Teste Nova, 789, Faro",
            "email": "maria.teste@example.com",
            "telefone": "912345678",
            "data_adesao": datetime.now().strftime("%Y-%m-%d"),
            "contribuicao_inicial": "50.00",
            "quota_mensal": "10.00",
            "data_assinatura": "____/____/______"
        }
        test_output = "/home/ubuntu/fininvest/membership_agreement_example.pdf"
        generate_pdf(test_output, test_data)

