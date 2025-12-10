// ExportUtility.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'CSV' | 'XLSX' | 'PDF';

export const downloadCSV = (data: any[], format: ExportFormat, fileName = 'report') => {
  if (!data.length) return;

    if (format === 'CSV' || format === 'XLSX') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      if (format === 'CSV') {
        const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'string' });
        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      }
    }

    if (format === 'PDF') {
      const doc = new jsPDF({ orientation: 'landscape' }); // Use landscape mode if needed
      const headers = [Object.keys(data[0])];
      const rows = data.map(row => Object.values(row) as any[]);
    
      autoTable(doc, {
        head: headers,
        body: rows,
        styles: {
          cellPadding: 2, // Increase padding for better readability
          fontSize: 8, // Adjust font size
          valign: 'middle',
          overflow: 'linebreak', // Allow text wrapping
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust column widths dynamically
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          // You can add more column index mappings if necessary
        },
        margin: { top: 10, left: 5, right: 5 }, // Adjust margins
      });
    
      doc.save(`${fileName}.pdf`);
    }
    

};