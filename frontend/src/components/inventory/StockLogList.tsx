import { StockLog } from '@shared/types'
import { Button } from '@/components/common/Button'
import { formatDate } from '@/utils/dateUtils'
import { formatLogType, formatQty } from '@/utils/formatters'

export function StockLogList({ logs, unit, onDelete }: { logs: StockLog[]; unit: string; onDelete: (id: string) => void }) {
  if (logs.length === 0) return <p className="text-sm text-gray-500">No stock activity has been logged yet.</p>
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3">{formatDate(log.date)}</td>
              <td className="px-4 py-3">{formatLogType(log.logType)}</td>
              <td className="px-4 py-3">{formatQty(log.qtyChange, unit)}</td>
              <td className="px-4 py-3">{log.notes ?? '-'}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" onClick={() => onDelete(log.id)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
