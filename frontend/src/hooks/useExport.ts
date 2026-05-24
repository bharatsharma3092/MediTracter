import { reportService } from '@/services/reportService'
import { exportRowsCsv, exportRowsXlsx } from '@/utils/csvExporter'
import { exportInventoryPDF, exportReorderPDF } from '@/utils/pdfExporter'

export function useExport() {
  return {
    exportReorderPdf: async () => exportReorderPDF(await reportService.reorder()),
    exportInventoryPdf: async () => exportInventoryPDF(await reportService.inventory()),
    exportReorderXlsx: async () => exportRowsXlsx(await reportService.reorder(), 'meditrack-reorder-list.xlsx'),
    exportInventoryXlsx: async () => exportRowsXlsx(await reportService.inventory(), 'meditrack-inventory.xlsx'),
    exportReorderCsv: async () => exportRowsCsv(await reportService.reorder(), 'meditrack-reorder-list.csv'),
    exportInventoryCsv: async () => exportRowsCsv(await reportService.inventory(), 'meditrack-inventory.csv')
  }
}
