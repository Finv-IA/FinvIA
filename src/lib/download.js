export function downloadFile(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function toCSV(rows) {
  if (!rows?.length) return '\ufeff';
  const keys = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [keys.join(',')];
  rows.forEach((row) => {
    lines.push(keys.map((key) => escape(row[key])).join(','));
  });
  return `\ufeff${lines.join('\n')}`;
}