import * as XLSX from 'xlsx'

export function exportToExcel(data, filename, sheetName = 'Dados') {
  if (!data || data.length === 0) return
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const cols = Object.keys(data[0]).map(k => ({ wch: Math.max(k.length, ...data.map(r => String(r[k] ?? '').length)) + 2 }))
  ws['!cols'] = cols
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`)
}
