import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FullInventoryRow, QuickListRow, ReorderListItem } from '@shared/types'
import { formatDate } from './dateUtils'

function title(doc: jsPDF, label: string) {
  doc.setFontSize(18)
  doc.text(label, 14, 18)
  doc.setFontSize(10)
  doc.text(`Generated ${formatDate(new Date().toISOString())}`, 14, 26)
}

export function exportReorderPDF(items: ReorderListItem[]) {
  const doc = new jsPDF()
  title(doc, 'MediTrack Pro Reorder List')
  autoTable(doc, {
    startY: 34,
    head: [['Item', 'Category', 'Current', 'Order', 'Unit', 'Expiry', 'Notes']],
    body: items.map((item) => [
      item.itemName,
      item.category,
      item.currentStock,
      item.qtyToOrder,
      item.unit,
      formatDate(item.expiryDate),
      item.notes ?? ''
    ])
  })
  doc.save('meditrack-reorder-list.pdf')
}

export function exportInventoryPDF(items: FullInventoryRow[]) {
  const doc = new jsPDF({ orientation: 'landscape' })
  title(doc, 'MediTrack Pro Inventory Snapshot')
  autoTable(doc, {
    startY: 34,
    head: [['Item', 'Type', 'Category', 'Current', 'Min', 'Unit', 'Expiry', '30d Used', 'Days Left']],
    body: items.map((item) => [
      item.name,
      item.itemType,
      item.category,
      item.currentQty,
      item.minQty,
      item.unit,
      formatDate(item.expiryDate),
      item.consumptionLast30Days?.toFixed(1) ?? '-',
      item.daysOfStockRemaining === undefined ? '-' : item.daysOfStockRemaining.toFixed(1)
    ])
  })
  doc.save('meditrack-inventory.pdf')
}

export function exportQuickListPDF(rows: QuickListRow[], label = 'Quick Needs List') {
  const doc = new jsPDF()
  title(doc, `MediTrack Pro ${label}`)
  autoTable(doc, {
    startY: 34,
    head: [['Medicine', 'Category', 'Quantity', 'Unit']],
    body: rows.map((row) => [row.name, row.category, row.requestedQty, row.unit])
  })
  doc.save('meditrack-quick-list.pdf')
}
