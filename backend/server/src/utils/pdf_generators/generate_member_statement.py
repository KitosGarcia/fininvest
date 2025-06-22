import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFMemberStatement(FPDF):
    def __init__(self, member_name="", period_start="", period_end="", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.member_name = member_name
        self.period_start = period_start
        self.period_end = period_end
        self.col_widths = [25, 85, 25, 25, 30] # Date, Description, Debit, Credit, Balance
        self.line_height = 7

    def header(self):
        self.set_font("Helvetica", "B", 15)
        title = "Extrato de Conta Corrente - Sócio"
        title_w = self.get_string_width(title) + 6
        doc_w = self.w
        self.set_x((doc_w - title_w) / 2)
        self.cell(title_w, 10, title, border=0, ln=1, align="C", fill=0)
        self.ln(5)
        self.set_font("Helvetica", "", 11)
        self.cell(0, 6, f"Sócio: {self.member_name}", ln=1)
        self.cell(0, 6, f"Período: {self.period_start} a {self.period_end}", ln=1)
        self.ln(10)
        # Table Header
        self.set_font("Helvetica", "B", 10)
        self.set_fill_color(230, 230, 230)
        headers = ["Data", "Descrição", "Débito", "Crédito", "Saldo"]
        for i, header in enumerate(headers):
            self.cell(self.col_widths[i], self.line_height, header, border=1, align="C", fill=1)
        self.ln()

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")
        self.cell(0, 10, f"Emitido em: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}", align="L")
        self.cell(0, 10, "Fininvest - Gestão de Microcrédito", align="R")

    def add_table_row(self, row_data):
        self.set_font("Helvetica", "", 9)
        # Ensure data matches column count
        if len(row_data) != len(self.col_widths):
            print(f"Warning: Row data length mismatch. Expected {len(self.col_widths)}, got {len(row_data)}")
            return
            
        # Check page break before drawing row
        if self.get_y() + self.line_height > self.page_break_trigger:
            self.add_page(self.cur_orientation)

        # Draw cells
        for i, item in enumerate(row_data):
            align = "L"
            if i >= 2: # Align numeric columns (Debit, Credit, Balance) to the right
                align = "R"
            self.cell(self.col_widths[i], self.line_height, str(item), border=1, align=align)
        self.ln()

    def print_statement(self, statement_data):
        self.add_page()
        # statement_data should be a list of lists/tuples: 
        # [ [date, description, debit, credit, balance], ... ]
        # Example: [ ["2025-05-01", "Quota Maio", "100.00", "", "900.00"], ["2025-05-15", "Pagamento Quota Maio", "", "100.00", "1000.00"] ]
        for row in statement_data:
            self.add_table_row(row)
        
        # Add summary/final balance if needed
        if statement_data:
            final_balance = statement_data[-1][-1] # Get balance from last row
            self.ln(5)
            self.set_font("Helvetica", "B", 11)
            self.cell(sum(self.col_widths[:4]), self.line_height, "Saldo Final:", border=0, align="R")
            self.cell(self.col_widths[4], self.line_height, str(final_balance), border=1, align="R")
            self.ln()

def generate_pdf(output_path, member_name, period_start, period_end, statement_data):
    pdf = PDFMemberStatement(member_name, period_start, period_end)
    pdf.set_title(f"Extrato Sócio {member_name} {period_start}-{period_end}")
    pdf.set_author("Fininvest Platform")
    pdf.print_statement(statement_data)
    pdf.output(output_path)
    print(f"PDF member statement generated successfully at: {output_path}")

if __name__ == "__main__":
    # Example Usage: Called from Node.js via child_process (passing JSON might be better)
    if len(sys.argv) > 4:
        output_filename = sys.argv[1]
        member_name = sys.argv[2]
        period_start = sys.argv[3]
        period_end = sys.argv[4]
        # Expecting data as a JSON string in the 5th argument
        import json
        try:
            statement_data_json = sys.argv[5]
            statement_data = json.loads(statement_data_json)
            if not isinstance(statement_data, list):
                 raise ValueError("Statement data must be a JSON array of arrays.")
        except (IndexError, json.JSONDecodeError, ValueError) as e:
            print(f"Error processing statement data: {e}")
            print("Expected JSON string as 5th argument: '[["date", "desc", "debit", "credit", "balance"], ...]' ")
            sys.exit(1)
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, member_name, period_start, period_end, statement_data)
    else:
        print("Usage: python generate_member_statement.py <output_path> <member_name> <period_start> <period_end> <json_statement_data>")
        # Example default generation for testing
        test_member = "Nome Exemplo Sócio"
        test_start = "2025-01-01"
        test_end = "2025-05-31"
        test_data = [
            ["2025-01-15", "Adesão", "", "1000.00", "1000.00"],
            ["2025-02-01", "Quota Fev (Devida)", "100.00", "", "900.00"],
            ["2025-02-10", "Pagamento Quota Fev", "", "100.00", "1000.00"],
            ["2025-03-01", "Quota Mar (Devida)", "100.00", "", "900.00"],
            ["2025-03-15", "Pagamento Quota Mar", "", "100.00", "1000.00"],
            ["2025-04-01", "Quota Abr (Devida)", "100.00", "", "900.00"],
            ["2025-04-05", "Pagamento Quota Abr", "", "100.00", "1000.00"],
            ["2025-05-01", "Quota Mai (Devida)", "100.00", "", "900.00"],
            ["2025-05-18", "Pagamento Quota Mai", "", "100.00", "1000.00"],
            ["2025-05-30", "Rentabilidade (Placeholder)", "", "5.50", "1005.50"],
        ]
        test_output = "/home/ubuntu/fininvest/member_statement_example.pdf"
        generate_pdf(test_output, test_member, test_start, test_end, test_data)

