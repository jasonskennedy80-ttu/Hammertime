import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lineItemSchema, type LineItemFormValues } from '@/lib/validations/lineItem.schema'
import { FormField } from './FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { formatCurrency, lineItemTotal } from '@/lib/utils/format'
import { useState, useEffect } from 'react'
import type { LineItem } from '@/types/app.types'

interface LineItemFormProps {
  defaultValues?: LineItem
  nextSortOrder?: number
  onSubmit: (values: LineItemFormValues) => void
  isLoading?: boolean
}

const UNIT_OPTIONS = ['ea', 'lf', 'sf', 'sy', 'ls', 'hr', 'ton', 'lb', 'bag', 'set']

export function LineItemForm({ defaultValues, nextSortOrder = 0, onSubmit, isLoading }: LineItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LineItemFormValues>({
    resolver: zodResolver(lineItemSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description ?? '',
          quantity: defaultValues.quantity,
          unit: defaultValues.unit,
          unit_price: defaultValues.unit_price,
          markup_percent: defaultValues.markup_percent,
          taxable: defaultValues.taxable,
          sort_order: defaultValues.sort_order,
        }
      : {
          name: '',
          quantity: 1,
          unit: 'ls',
          unit_price: 0,
          markup_percent: 0,
          taxable: false,
          sort_order: nextSortOrder,
        },
  })

  const [qty, unitPrice, markup] = watch(['quantity', 'unit_price', 'markup_percent'])
  const [preview, setPreview] = useState(0)

  useEffect(() => {
    const q = Number(qty) || 0
    const p = Number(unitPrice) || 0
    const m = Number(markup) || 0
    setPreview(lineItemTotal(q, p, m))
  }, [qty, unitPrice, markup])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Item Name" required error={errors.name?.message}>
        <Input {...register('name')} hasError={!!errors.name} placeholder="Concrete Slab — 40x60" />
      </FormField>
      <FormField label="Description" error={errors.description?.message}>
        <Textarea {...register('description')} rows={2} placeholder="Optional details..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Quantity" required error={errors.quantity?.message}>
          <Input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            hasError={!!errors.quantity}
          />
        </FormField>
        <FormField label="Unit" required error={errors.unit?.message}>
          <Input
            {...register('unit')}
            hasError={!!errors.unit}
            list="unit-suggestions"
            placeholder="ls"
          />
          <datalist id="unit-suggestions">
            {UNIT_OPTIONS.map((u) => <option key={u} value={u} />)}
          </datalist>
        </FormField>
        <FormField label="Unit Price" required error={errors.unit_price?.message}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input
              {...register('unit_price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="pl-7"
              hasError={!!errors.unit_price}
            />
          </div>
        </FormField>
        <FormField label="Markup %" error={errors.markup_percent?.message}>
          <Input
            {...register('markup_percent', { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="500"
          />
        </FormField>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          {...register('taxable')}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span className="text-sm text-slate-700">Taxable</span>
      </label>
      <input type="hidden" {...register('sort_order', { valueAsNumber: true })} />

      {/* Live total preview */}
      <div className="bg-slate-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">Line Total</span>
        <span className="text-base font-semibold text-slate-900">{formatCurrency(preview)}</span>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        {defaultValues ? 'Save Item' : 'Add Item'}
      </Button>
    </form>
  )
}
