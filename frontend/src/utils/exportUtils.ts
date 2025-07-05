import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(data: object[], filename: string) {
  if (data.length === 0) {
    console.warn("Nenhum dado para exportar.");
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(field => `"${String(row[field] ?? "")}"`).join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


export function exportToPDF(data: object[], filename: string, title = 'Relatório') {
  if (data.length === 0) {
    console.warn("Nenhum dado para exportar.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 20);

  const headers = [Object.keys(data[0])];
  const rows = data.map((row) => Object.values(row));

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] }, // Azul do tema Jarvis
  });

  doc.save(`${filename}.pdf`);
}