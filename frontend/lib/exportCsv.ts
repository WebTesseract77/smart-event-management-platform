// frontend/lib/exportCsv.ts

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || rows.length === 0) {
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(rows[0]);
  
  // Create CSV content
  const csvRows = [];
  csvRows.push(headers.join(","));

  for (const row of rows) {
    const values = headers.map((header) => {
      const val = row[header] === null || row[header] === undefined ? "" : row[header];
      // Escape double quotes and wrap in quotes if contains comma
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};