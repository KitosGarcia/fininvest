import sys
import os
from fpdf import FPDF
from datetime import datetime

class PDFLoanStatement(FPDF):
    def __init__(self, client_name="", loan_id="", period_start="", period_end="", loan_details={}, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client_name = client_name
        self.loan_id = loan_id
        self.period_start = period_start
        self.period_end = period_end
        self.loan_details = loan_details # Dict with Amount, Rate, Term etc.
        self.col_widths = [25, 35, 60, 25, 25, 20] # Due Date, Payment Date, Description, Principal, Interest, Status
        self.line_height = 7

    def header(self):
        self.set_font("Helvetica", "B", 15)
        title = "Extrato de Empréstimo"
        title_w = self.get_string_width(title) + 6
        doc_w = self.w
        self.set_x((doc_w - title_w) / 2)
        self.cell(title_w, 10, title, border=0, ln=1, align="C", fill=0)
        self.ln(5)
        self.set_font("Helvetica", "", 11)
        self.cell(0, 6, f"Cliente: {self.client_name}", ln=1)
        self.cell(0, 6, f"Empréstimo ID: {self.loan_id}", ln=1)
        self.cell(0, 6, f"Período do Extrato: {self.period_start} a {self.period_end}", ln=1)
        # Add Loan Summary Details
        self.ln(5)
        self.set_font("Helvetica", "B", 10)
        self.cell(doc_w / 2, 6, "Resumo do Empréstimo:", ln=0)
        self.ln(6)
        self.set_font("Helvetica", "", 10)
        details_str = f"Valor Aprovado: {self.loan_details.get("amount_approved", "N/A")} EUR | Taxa Juro: {self.loan_details.get("interest_rate", "N/A")} % | Prazo: {self.loan_details.get("repayment_term_months", "N/A")} meses"
        self.multi_cell(0, 5, details_str, ln=1)
        self.ln(10)
        # Table Header
        self.set_font("Helvetica", "B", 9) # Smaller font for more columns
        self.set_fill_color(230, 230, 230)
        headers = ["Vencimento", "Data Pag.", "Descrição", "Capital", "Juros", "Estado"]
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
        self.set_font("Helvetica", "", 8) # Smaller font for table content
        if len(row_data) != len(self.col_widths):
            print(f"Warning: Row data length mismatch. Expected {len(self.col_widths)}, got {len(row_data)}")
            return
            
        if self.get_y() + self.line_height > self.page_break_trigger:
            self.add_page(self.cur_orientation)

        for i, item in enumerate(row_data):
            align = "L"
            if i == 3 or i == 4: # Align numeric columns (Principal, Interest) to the right
                align = "R"
            elif i == 0 or i == 1 or i == 5: # Center dates and status
                 align = "C"
            self.cell(self.col_widths[i], self.line_height, str(item), border=1, align=align)
        self.ln()

    def print_statement(self, statement_data):
        self.add_page()
        # statement_data should be a list of lists/tuples: 
        # [ [due_date, payment_date, description, principal, interest, status], ... ]
        for row in statement_data:
            self.add_table_row(row)
        
        # Add summary/totals if needed
        # Example: Calculate total paid, remaining balance
        # total_principal_paid = sum(float(row[3]) for row in statement_data if row[5] == "paid" and row[3])
        # total_interest_paid = sum(float(row[4]) for row in statement_data if row[5] == "paid" and row[4])
        # remaining_principal = float(self.loan_details.get("amount_approved", 0)) - total_principal_paid
        # self.ln(5)
        # self.set_font("Helvetica", "B", 10)
        # self.cell(sum(self.col_widths[:3]), self.line_height, "Total Capital Pago:", border=0, align="R")
        # self.cell(self.col_widths[3], self.line_height, f"{total_principal_paid:.2f}", border=1, align="R")
        # self.ln()
        # self.cell(sum(self.col_widths[:4]), self.line_height, "Total Juros Pago:", border=0, align="R")
        # self.cell(self.col_widths[4], self.line_height, f"{total_interest_paid:.2f}", border=1, align="R")
        # self.ln()
        # self.cell(sum(self.col_widths[:3]), self.line_height, "Saldo Capital Devedor:", border=0, align="R")
        # self.cell(self.col_widths[3], self.line_height, f"{remaining_principal:.2f}", border=1, align="R")
        # self.ln()

def generate_pdf(output_path, client_name, loan_id, period_start, period_end, loan_details, statement_data):
    pdf = PDFLoanStatement(client_name, loan_id, period_start, period_end, loan_details)
    pdf.set_title(f"Extrato Empréstimo {loan_id} {period_start}-{period_end}")
    pdf.set_author("Fininvest Platform")
    pdf.print_statement(statement_data)
    pdf.output(output_path)
    print(f"PDF loan statement generated successfully at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 6:
        output_filename = sys.argv[1]
        client_name = sys.argv[2]
        loan_id = sys.argv[3]
        period_start = sys.argv[4]
        period_end = sys.argv[5]
        import json
        try:
            loan_details_json = sys.argv[6]
            loan_details = json.loads(loan_details_json)
            statement_data_json = sys.argv[7]
            statement_data = json.loads(statement_data_json)
            if not isinstance(statement_data, list) or not isinstance(loan_details, dict):
                 raise ValueError("Loan details must be JSON object, statement data must be JSON array.")
        except (IndexError, json.JSONDecodeError, ValueError) as e:
            print(f"Error processing input data: {e}")
            print("Expected JSON string for loan details (arg 6) and statement data (arg 7)")
            sys.exit(1)
        
        output_dir = os.path.dirname(output_filename)
        if output_dir and not os.path.exists(output_dir):
             os.makedirs(output_dir)

        generate_pdf(output_filename, client_name, loan_id, period_start, period_end, loan_details, statement_data)
    else:
        print("Usage: python generate_loan_statement.py <output_path> <client_name> <loan_id> <period_start> <period_end> <json_loan_details> <json_statement_data>")
        # Example default generation for testing
        test_client = "Nome Exemplo Cliente"
        test_loan_id = "L005"
        test_start = "2025-01-01"
        test_end = "2025-12-31"
        test_loan_details = {
            "amount_approved": "5000.00",
            "interest_rate": "5.50",
            "repayment_term_months": "24"
        }
        test_data = [
            ["2025-06-23", "", "Prestação 1", "199.84", "22.92", "pending"],
            ["2025-07-23", "", "Prestação 2", "200.76", "22.00", "pending"],
            ["2025-08-23", "2025-08-20", "Prestação 3", "201.69", "21.07", "paid"],
            # ... more rows
        ]
        test_output = "/home/ubuntu/fininvest/loan_statement_example.pdf"
        generate_pdf(test_output, test_client, test_loan_id, test_start, test_end, test_loan_details, test_data)

