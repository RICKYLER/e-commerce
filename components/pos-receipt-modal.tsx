'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  Printer,
  ReceiptText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPHP } from '@/lib/currency'
import {
  printPosReceipt,
  type ReceiptPaperFormat,
} from '@/lib/pos-receipt-print'
import { SITE_NAME } from '@/lib/site'
import {
  canActorVoidPosOrder,
  parsePosReceiptMetadata,
  type OrderRecord,
  type PosTransaction,
  type StoreActor,
} from '@/lib/store-engine'
import { toast } from '@/hooks/use-toast'

const RECEIPT_FORMAT_STORAGE_KEY = 'pos_receipt_paper_format'
const PAPER_FORMAT_OPTIONS: Array<{ value: ReceiptPaperFormat; label: string }> = [
  { value: '80mm', label: '80mm' },
  { value: '58mm', label: '58mm' },
  { value: 'a4', label: 'A4' },
]

interface PosReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderRecord | null
  transaction?: PosTransaction | null
  actor?: Pick<StoreActor, 'role'> | null
  fallbackTendered?: number
  onVoidSale: (orderId: string, reason: string) => Promise<boolean>
}

const VOID_REASON_PRESETS = [
  'Customer changed mind',
  'Wrong item or size entered',
  'Payment or change adjustment',
]

export function PosReceiptModal({
  open,
  onOpenChange,
  order,
  transaction,
  actor,
  fallbackTendered,
  onVoidSale,
}: PosReceiptModalProps) {
  const [isConfirmingVoid, setIsConfirmingVoid] = useState(false)
  const [voidReason, setVoidReason] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [paperFormat, setPaperFormat] = useState<ReceiptPaperFormat>('80mm')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(RECEIPT_FORMAT_STORAGE_KEY)
      if (saved === '80mm' || saved === '58mm' || saved === 'a4') {
        setPaperFormat(saved)
      }
    } catch {
      // Ignore storage access errors
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setIsConfirmingVoid(false)
      setVoidReason('')
      setIsVoiding(false)
      setIsPrinting(false)
    }
  }, [open, order?.id])

  const handleSelectPaperFormat = (nextFormat: ReceiptPaperFormat) => {
    setPaperFormat(nextFormat)
    try {
      window.localStorage.setItem(RECEIPT_FORMAT_STORAGE_KEY, nextFormat)
    } catch {
      // Ignore storage access errors
    }
  }

  const handlePrint = async () => {
    if (!order || isPrinting) return
    setIsPrinting(true)
    try {
      await printPosReceipt({
        order,
        transaction,
        paperFormat,
        fallbackTendered,
      })
    } catch (error) {
      toast({
        title: 'Unable to print receipt',
        description:
          error instanceof Error ? error.message : 'Please check your browser print settings.',
        variant: 'destructive',
      })
    } finally {
      setIsPrinting(false)
    }
  }

  if (!order) {
    return null
  }

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

  const voidCheck = canActorVoidPosOrder(order, actor)
  const cancelledEntry = [...order.timeline]
    .reverse()
    .find((entry) => entry.status === 'Cancelled')

  const handleConfirmVoid = async () => {
    if (isVoiding || !voidReason.trim()) return
    setIsVoiding(true)
    try {
      const ok = await onVoidSale(order.id, voidReason.trim())
      if (ok) {
        setIsConfirmingVoid(false)
        setVoidReason('')
      }
    } finally {
      setIsVoiding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ui="pos-receipt-modal"
        className="max-w-lg max-h-[90svh] overflow-y-auto bg-card text-foreground border-border"
      >
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <ReceiptText className="h-5 w-5 text-accent" />
            POS Official Receipt
          </DialogTitle>
          <DialogDescription>
            Review, print, or manage this completed point-of-sale transaction.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Receipt Surface */}
        <div
          id="pos-printable-receipt"
          className="rounded-xl border border-border bg-background p-5 space-y-4 text-sm"
        >
          {/* Store Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
            <div>
              <p className="font-serif text-lg font-semibold tracking-tight text-foreground">
                {SITE_NAME}
              </p>
              <p className="text-xs text-foreground/60">In-Store Point of Sale Receipt</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isVoided
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isVoided ? (
                <>
                  <Ban className="h-3 w-3" />
                  Voided
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Paid
                </>
              )}
            </span>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pb-3 border-b border-border">
            {transaction?.id && (
              <div>
                <p className="text-foreground/55">Receipt No.</p>
                <p className="font-medium text-foreground">{transaction.id}</p>
              </div>
            )}
            <div>
              <p className="text-foreground/55">Order Ref</p>
              <p className="font-medium text-foreground">{order.id}</p>
            </div>
            <div>
              <p className="text-foreground/55">Date & Time</p>
              <p className="font-medium text-foreground">
                {new Date(order.createdAt).toLocaleString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-foreground/55">Cashier</p>
              <p className="font-medium text-foreground">
                {transaction?.cashierName || 'Store Staff'}
              </p>
            </div>
            <div>
              <p className="text-foreground/55">Customer</p>
              <p className="font-medium text-foreground">{order.customerName}</p>
            </div>
            <div>
              <p className="text-foreground/55">Payment Method</p>
              <p className="font-medium text-foreground">
                {order.paymentMethod}
                {meta.paymongoChannel ? ` (${meta.paymongoChannel.toUpperCase()})` : ''}
              </p>
            </div>
          </div>

          {/* Itemized Line Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-foreground/60">
                  <th className="py-1.5 text-left font-medium">Item</th>
                  <th className="py-1.5 text-right font-medium">Qty</th>
                  <th className="py-1.5 text-right font-medium">Price</th>
                  <th className="py-1.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr
                    key={`${item.productId}-${item.size}-${idx}`}
                    className="border-b border-border/50 last:border-b-0"
                  >
                    <td className="py-2 pr-2">
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-[11px] text-foreground/55">{item.size}ml</p>
                    </td>
                    <td className="py-2 text-right text-foreground/80">{item.quantity}</td>
                    <td className="py-2 text-right text-foreground/80">
                      {formatPHP(item.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-medium text-foreground">
                      {formatPHP(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-3 border-t border-border space-y-1.5 text-xs">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>{formatPHP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>12% VAT</span>
              <span>{formatPHP(order.tax)}</span>
            </div>
            <div
              className={`flex justify-between pt-2 border-t border-border text-base font-semibold ${
                isVoided ? 'text-foreground/55 line-through' : 'text-foreground'
              }`}
            >
              <span>Total</span>
              <span className={isVoided ? '' : 'text-accent'}>{formatPHP(order.total)}</span>
            </div>

            {order.paymentMethod === 'Cash' && effectiveTendered !== undefined && (
              <div className="pt-2 space-y-1 text-xs text-foreground/75">
                <div className="flex justify-between">
                  <span>Cash Received</span>
                  <span className="font-medium text-foreground">
                    {formatPHP(effectiveTendered)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change</span>
                  <span className="font-medium text-foreground">
                    {formatPHP(effectiveChange ?? 0)}
                  </span>
                </div>
              </div>
            )}

            {meta.paymongoRef && (
              <div className="pt-2 text-[11px] text-foreground/60">
                <span>PayMongo Ref: </span>
                <span className="font-medium text-foreground">{meta.paymongoRef}</span>
              </div>
            )}

            {meta.cashierNote && (
              <div className="pt-2 text-[11px] text-foreground/60">
                <span>Note: </span>
                <span className="text-foreground">{meta.cashierNote}</span>
              </div>
            )}
          </div>

          {/* Voided Status Notice */}
          {isVoided && cancelledEntry && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-semibold">Transaction Voided & Stock Restored</p>
              <p>{cancelledEntry.note}</p>
              <p className="text-[11px] opacity-80">
                Voided by {cancelledEntry.actorName || 'Store Staff'} on{' '}
                {new Date(cancelledEntry.createdAt).toLocaleString('en-PH')}
              </p>
            </div>
          )}

          <p className="text-center text-[11px] text-foreground/50 pt-2">
            Thank you for shopping at {SITE_NAME}.
          </p>
        </div>

        {/* Void Confirmation Form (not printed) */}
        {!isVoided && isConfirmingVoid && (
          <div className="print:hidden rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-foreground">
                  Void transaction and restore inventory stock?
                </p>
                <p className="text-foreground/70">
                  {order.paymentMethod === 'Cash'
                    ? `This will cancel ${order.id}, return ${order.items.reduce((s, i) => s + i.quantity, 0)} unit(s) to stock, and exclude ${formatPHP(order.total)} from revenue. Return cash directly from the drawer.`
                    : `This will cancel ${order.id} and restore inventory stock. Note: PayMongo QR Ph / GCash payments must be refunded manually in the PayMongo Dashboard.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {VOID_REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVoidReason(preset)}
                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    voidReason === preset
                      ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      : 'border-border bg-background text-foreground/70 hover:bg-muted'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="pos-void-reason" className="text-xs font-medium text-foreground">
                Reason for voiding
              </label>
              <input
                id="pos-void-reason"
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason (e.g., Customer changed mind)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isVoiding}
                onClick={() => {
                  setIsConfirmingVoid(false)
                  setVoidReason('')
                }}
              >
                Keep Sale
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isVoiding || !voidReason.trim()}
                onClick={() => void handleConfirmVoid()}
              >
                {isVoiding ? 'Voiding...' : 'Confirm Void Sale'}
              </Button>
            </div>
          </div>
        )}

        {!isVoided && !voidCheck.allowed && voidCheck.reason && (
          <p className="print:hidden text-xs text-foreground/55">{voidCheck.reason}</p>
        )}

        <DialogFooter className="pt-2 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isVoided && voidCheck.allowed && !isConfirmingVoid && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-400"
                onClick={() => setIsConfirmingVoid(true)}
              >
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                Void / Cancel Sale
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div
              role="group"
              aria-label="Receipt paper format"
              className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 text-[11px]"
            >
              {PAPER_FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectPaperFormat(option.value)}
                  className={`rounded-md px-2 py-1 font-medium transition-colors ${
                    paperFormat === option.value
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/65 hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPrinting}
              onClick={() => void handlePrint()}
            >
              {isPrinting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Printer className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isPrinting ? 'Preparing...' : 'Print Receipt'}
            </Button>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
