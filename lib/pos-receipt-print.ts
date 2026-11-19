import { formatPHP } from '@/lib/currency'
import { SITE_NAME } from '@/lib/site'
import {
  parsePosReceiptMetadata,
  type OrderRecord,
  type PosTransaction,
} from '@/lib/store-engine'

export type ReceiptPaperFormat = '80mm' | '58mm' | 'a4'

export interface PrintPosReceiptInput {
  order: OrderRecord
  transaction?: PosTransaction | null
  paperFormat?: ReceiptPaperFormat
  fallbackTendered?: number
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getPaperLayoutConfig(format: ReceiptPaperFormat) {
  switch (format) {
    case '58mm':
      return {
        pageSize: '58mm auto',
        pageMargin: '3mm',
        bodyWidth: '52mm',
        baseFontSize: '10px',
        titleSize: '14px',
        totalSize: '13px',
      }
    case 'a4':
      return {
        pageSize: 'A4',
        pageMargin: '16mm',
        bodyWidth: '140mm',
        baseFontSize: '13px',
        titleSize: '20px',
        totalSize: '16px',
      }
    case '80mm':
    default:
      return {
        pageSize: '80mm auto',
        pageMargin: '4mm',
        bodyWidth: '72mm',
        baseFontSize: '11px',
        titleSize: '16px',
        totalSize: '14px',
      }
  }
}

export function buildPosReceiptHtml({
  order,
  transaction,
  paperFormat = '80mm',
  fallbackTendered,
}: PrintPosReceiptInput): string {
  const layout = getPaperLayoutConfig(paperFormat)
  const isVoided = order.status === 'Cancelled'
  const meta = parsePosReceiptMetadata(order.notes)
  const effectiveTendered =
    meta.tenderedAmount ??
    (order.paymentMethod === 'Cash' ? (fallbackTendered ?? order.total) : undefined)
  const effectiveChange =
    meta.changeAmount ??
    (effectiveTendered !== undefined
      ? Math.max(0, Math.round((effectiveTendered - order.total) * 100) / 100)
      : undefined)

  const cancelledEntry = [...order.timeline]
    .reverse()
    .find((entry) => entry.status === 'Cancelled')

  const formattedDate = new Date(order.createdAt).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const itemRowsHtml = order.items
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity
      return `
        <tr>
          <td class="item-name">
            <div class="bold">${escapeHtml(item.productName)}</div>
            <div class="muted">${escapeHtml(String(item.size))}ml @ ${escapeHtml(formatPHP(item.unitPrice))}</div>
          </td>
          <td class="num">${escapeHtml(String(item.quantity))}</td>
          <td class="num bold">${escapeHtml(formatPHP(lineTotal))}</td>
        </tr>
      `
    })
    .join('')

  const paymentMethodDisplay = meta.paymongoChannel
    ? `${order.paymentMethod} (${meta.paymongoChannel.toUpperCase()})`
    : order.paymentMethod

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Receipt ${escapeHtml(transaction?.id || order.id)}</title>
  <style>
    @page {
      size: ${layout.pageSize};
      margin: ${layout.pageMargin};
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: ${layout.baseFontSize};
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt-sheet {
      width: 100%;
      max-width: ${layout.bodyWidth};
      margin: 0 auto;
      padding: ${paperFormat === 'a4' ? '16px 20px' : '4px 0'};
      border: ${paperFormat === 'a4' ? '1.5px solid #222222' : 'none'};
    }

    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1.5px dashed #444444;
    }

    .store-name {
      margin: 0;
      font-size: ${layout.titleSize};
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .subtitle {
      margin: 2px 0 0;
      color: #444444;
    }

    .status-stamp {
      display: inline-block;
      margin-top: 6px;
      padding: 2px 8px;
      border: 1.5px solid #111111;
      font-weight: 700;
      font-size: 0.9em;
    }

    .meta {
      padding: 10px 0;
      border-bottom: 1.5px dashed #444444;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 3px;
    }

    .meta-row:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #555555;
    }

    .bold {
      font-weight: 600;
    }

    .muted {
      color: #555555;
      font-size: 0.9em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }

    thead th {
      text-align: left;
      padding: 4px 0 6px;
      border-bottom: 1.5px solid #111111;
      font-weight: 700;
    }

    thead th.num,
    tbody td.num {
      text-align: right;
      white-space: nowrap;
      vertical-align: top;
      padding-left: 6px;
    }

    tbody td {
      padding: 6px 0;
      border-bottom: 1px dotted #999999;
      vertical-align: top;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .totals {
      padding-top: 8px;
      border-top: 1.5px dashed #444444;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .grand-total {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 2px solid #111111;
      font-size: ${layout.totalSize};
      font-weight: 700;
    }

    .grand-total.voided {
      text-decoration: line-through;
      color: #555555;
    }

    .tender-block {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1.5px dashed #444444;
    }

    .note-block {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1.5px dashed #444444;
      color: #333333;
      word-break: break-word;
    }

    .void-box {
      margin-top: 10px;
      padding: 8px;
      border: 1.5px solid #111111;
      background: #f5f5f5;
    }

    .footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1.5px dashed #444444;
      text-align: center;
      color: #444444;
    }
  </style>
</head>
<body>
  <div class="receipt-sheet">
    <div class="header">
      <p class="store-name">${escapeHtml(SITE_NAME)}</p>
      <p class="subtitle">Official In-Store Receipt</p>
      <div class="status-stamp">${isVoided ? 'VOIDED / CANCELLED' : 'PAID'}</div>
    </div>

    <div class="meta">
      ${
        transaction?.id
          ? `<div class="meta-row"><span class="label">Receipt No.</span><span class="bold">${escapeHtml(transaction.id)}</span></div>`
          : ''
      }
      <div class="meta-row"><span class="label">Order Ref</span><span class="bold">${escapeHtml(order.id)}</span></div>
      <div class="meta-row"><span class="label">Date</span><span>${escapeHtml(formattedDate)}</span></div>
      <div class="meta-row"><span class="label">Cashier</span><span>${escapeHtml(transaction?.cashierName || 'Store Staff')}</span></div>
      <div class="meta-row"><span class="label">Customer</span><span>${escapeHtml(order.customerName)}</span></div>
      <div class="meta-row"><span class="label">Payment</span><span>${escapeHtml(paymentMethodDisplay)}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">Qty</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="label">Subtotal</span>
        <span>${escapeHtml(formatPHP(order.subtotal))}</span>
      </div>
      <div class="total-row">
        <span class="label">12% VAT</span>
        <span>${escapeHtml(formatPHP(order.tax))}</span>
      </div>
      <div class="grand-total ${isVoided ? 'voided' : ''}">
        <span>TOTAL</span>
        <span>${escapeHtml(formatPHP(order.total))}</span>
      </div>
    </div>

    ${
      order.paymentMethod === 'Cash' && effectiveTendered !== undefined
        ? `<div class="tender-block">
            <div class="total-row">
              <span class="label">Cash Received</span>
              <span class="bold">${escapeHtml(formatPHP(effectiveTendered))}</span>
            </div>
            <div class="total-row">
              <span class="label">Change</span>
              <span class="bold">${escapeHtml(formatPHP(effectiveChange ?? 0))}</span>
            </div>
          </div>`
        : ''
    }

    ${
      meta.paymongoRef
        ? `<div class="note-block"><span class="label">PayMongo Ref:</span> ${escapeHtml(meta.paymongoRef)}</div>`
        : ''
    }

    ${
      meta.cashierNote
        ? `<div class="note-block"><span class="label">Note:</span> ${escapeHtml(meta.cashierNote)}</div>`
        : ''
    }

    ${
      isVoided && cancelledEntry
        ? `<div class="void-box">
            <div class="bold">TRANSACTION VOIDED &amp; STOCK RESTORED</div>
            <div>${escapeHtml(cancelledEntry.note)}</div>
            <div class="muted">By ${escapeHtml(cancelledEntry.actorName || 'Store Staff')} on ${escapeHtml(new Date(cancelledEntry.createdAt).toLocaleString('en-PH'))}</div>
          </div>`
        : ''
    }

    <div class="footer">
      <div>Thank you for shopping at ${escapeHtml(SITE_NAME)}.</div>
    </div>
  </div>
</body>
</html>`
}

export async function printPosReceipt(input: PrintPosReceiptInput): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Printing is only available in the browser.')
  }

  const html = buildPosReceiptHtml(input)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'

  document.body.appendChild(iframe)

  const cleanup = () => {
    window.setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }, 500)
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false

    const triggerPrint = () => {
      if (settled) return
      settled = true

      const frameWin = iframe.contentWindow
      if (!frameWin) {
        cleanup()
        reject(new Error('Unable to initialize receipt print frame.'))
        return
      }

      const handleAfterPrint = () => {
        frameWin.removeEventListener('afterprint', handleAfterPrint)
        cleanup()
      }

      frameWin.addEventListener('afterprint', handleAfterPrint)
      frameWin.focus()
      frameWin.print()
      // Fallback cleanup in case a browser does not fire afterprint on iframes
      window.setTimeout(cleanup, 60_000)
      resolve()
    }

    iframe.onload = triggerPrint

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc) {
      cleanup()
      reject(new Error('Unable to access print document.'))
      return
    }

    doc.open()
    doc.write(html)
    doc.close()

    // Fallback in case onload does not fire after document.close()
    window.setTimeout(triggerPrint, 150)
  })
}
