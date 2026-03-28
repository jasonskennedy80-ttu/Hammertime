import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { upsertPaymentSchedule } from '@/services/paymentSchedule.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils/format'
import type { PaymentScheduleItem } from '@/types/app.types'

interface PaymentScheduleEditorProps {
  projectId: string
  projectTotal: number
  initialItems: PaymentScheduleItem[]
  onSave: () => void
}

interface DraftItem {
  id?: string
  label: string
  amount: number
  due_trigger: string
}

const QUICK_DRAWS = [
  { label: 'Acceptance Draw', due_trigger: 'Due upon contract signing' },
  { label: 'Framing Draw', due_trigger: 'Due upon framing completion' },
  { label: 'Sheet & Trim', due_trigger: 'Due upon sheet metal and trim installation' },
  { label: 'Concrete Draw', due_trigger: 'Due upon concrete slab completion' },
  { label: 'Doors & Windows', due_trigger: 'Due upon installation of doors and windows' },
  { label: 'Final Payment', due_trigger: 'Due upon substantial completion' },
]

export function PaymentScheduleEditor({
  projectId,
  projectTotal,
  initialItems,
  onSave,
}: PaymentScheduleEditorProps) {
  const [items, setItems] = useState<DraftItem[]>(
    initialItems.length > 0
      ? initialItems.map((i) => ({ id: i.id, label: i.label, amount: i.amount, due_trigger: i.due_trigger }))
      : [],
  )
  const [isSaving, setIsSaving] = useState(false)

  const totalScheduled = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  const remaining = projectTotal - totalScheduled
  const isBalanced = Math.abs(remaining) < 0.01

  function addBlankItem() {
    setItems((prev) => [...prev, { label: '', amount: 0, due_trigger: '' }])
  }

  function addQuickDraw(draw: (typeof QUICK_DRAWS)[number]) {
    setItems((prev) => [...prev, { label: draw.label, amount: 0, due_trigger: draw.due_trigger }])
  }

  function update(index: number, field: keyof DraftItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await upsertPaymentSchedule(
        projectId,
        items.map((item, i) => ({
          label: item.label,
          amount: Number(item.amount) || 0,
          due_trigger: item.due_trigger,
          sort_order: i,
        })),
      )
      onSave()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick add buttons */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Quick add common draws:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DRAWS.map((draw) => (
            <button
              key={draw.label}
              onClick={() => addQuickDraw(draw)}
              className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-sky-300 transition-colors"
            >
              + {draw.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => update(i, 'label', e.target.value)}
                  placeholder="Draw label (e.g. Framing Draw)"
                  className="flex-1"
                />
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.amount || ''}
                    onChange={(e) => update(i, 'amount', parseFloat(e.target.value) || 0)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={() => remove(i)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <Input
                value={item.due_trigger}
                onChange={(e) => update(i, 'due_trigger', e.target.value)}
                placeholder="Due trigger (e.g. Due upon framing completion)"
              />
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" size="sm" onClick={addBlankItem} leftIcon={<PlusIcon />}>
        Add Draw
      </Button>

      {/* Balance summary */}
      {projectTotal > 0 && items.length > 0 && (
        <div className={`rounded-lg px-4 py-3 text-sm flex justify-between ${isBalanced ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
          <span>
            {isBalanced
              ? 'Schedule is balanced'
              : remaining > 0
              ? `${formatCurrency(remaining)} unscheduled`
              : `${formatCurrency(Math.abs(remaining))} over project total`}
          </span>
          <span>
            {formatCurrency(totalScheduled)} / {formatCurrency(projectTotal)}
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} isLoading={isSaving} className="w-full">
          Save Schedule
        </Button>
      </div>
    </div>
  )
}
