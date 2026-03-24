import { useState, useEffect, useRef } from 'react'
import { Text, TextInput, Select } from '@mantine/core'

interface EditableCellProps {
  value:         unknown
  field:         string
  type?:         string
  options?:      string[]
  isEditing:     boolean
  onChange:      (field: string, value: unknown, rerender?: boolean) => void
  booleanFields?: string[]
  width?:        number
}

export function EditableCell({
  value,
  field,
  type = 'text',
  options,
  isEditing,
  onChange,
  booleanFields = [],
  width,
}: EditableCellProps) {
  const toStr = (v: unknown): string => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (!v && v !== 0) return ''
    return String(v).split('T')[0]   // strips ISO timestamp
  }

  const [localValue, setLocalValue]   = useState<string>(toStr(value))
  const [selectValue, setSelectValue] = useState<string>(toStr(value))

  const wasEditing = useRef(false)
  useEffect(() => {
    if (isEditing && !wasEditing.current) {
      setLocalValue(toStr(value))
      setSelectValue(toStr(value))
    }
    wasEditing.current = isEditing
  }, [isEditing])

  if (!isEditing) {
    if (typeof value === 'boolean') return <Text size="sm">{value ? 'Yes' : 'No'}</Text>
    const display = toStr(value)
    return <Text size="sm">{display || '—'}</Text>
  }

  if (options) {
    return (
      <Select
        size="xs"
        value={selectValue}
        onChange={(v) => {
          const next = v ?? ''
          setSelectValue(next)
          if (booleanFields.includes(field)) {
            onChange(field, next === 'Yes', true)
          } else {
            onChange(field, next || null, true)
          }
        }}
        data={options}
        style={{ minWidth: width ?? 120 }}
      />
    )
  }

  return (
    <TextInput
      size="xs"
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => {
        const raw = e.target.value
        if (type === 'number') {
          onChange(field, raw ? Number(raw) : null, false)
        } else {
          onChange(field, raw || null, false)
        }
      }}
      style={{ minWidth: width ?? 100 }}
      autoComplete="off"
    />
  )
}