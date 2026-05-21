import { useState, useEffect, useRef } from 'react'
import { Text, TextInput, Select, Stack } from '@mantine/core'

// maximum characters allowed in a free-text cell
// does NOT apply to select, boolean, number, or date fields
const MAX_CELL_LENGTH = 50

// show the counter only when the user is near or over the limit
const COUNTER_SHOW_THRESHOLD = 40

interface EditableCellProps {
  value:         unknown
  field:         string
  type?:         string
  options?:      string[]
  isEditing:     boolean
  onChange:      (field: string, value: unknown, rerender?: boolean) => void
  booleanFields?: string[]
  width?:         number
  disabled?:      boolean
  onBlur?: (value: unknown) => void
  onEnter?: () => void
  placeholder?:   string
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
  disabled = false,
  onBlur,
  onEnter,
  placeholder,
}: EditableCellProps) {
  // converts any value to a display string; strips time from ISO datetimes
  const toStr = (v: unknown): string => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (!v && v !== 0) return ''
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.split('T')[0]
    return s
  }

  const [localValue, setLocalValue]   = useState<string>(toStr(value))
  const [selectValue, setSelectValue] = useState<string>(toStr(value))

  // tracks focus state to avoid overwriting user input when the parent value updates
  const isFocused = useRef(false)

  // sync local state when value changes externally, but only if the cell isn't focused
  useEffect(() => {
    if (isEditing && !isFocused.current) {
      setLocalValue(toStr(value))
      setSelectValue(toStr(value))
    }
  }, [value])

  if (!isEditing) {
    if (typeof value === 'boolean') return <Text size="sm">{value ? 'Yes' : 'No'}</Text>
    const display = toStr(value)
    return <Text size="sm">{display || '—'}</Text>
  }

  // dropdown for fields with predefined options
  if (options) {
    return (
      <Select
        size="xs"
        value={selectValue}
        onChange={(v) => {
          const next = v ?? ''
          setSelectValue(next)
          // boolean fields store true/false instead of "Yes"/"No" strings
          if (booleanFields.includes(field)) {
            onChange(field, next === 'Yes', true)
          } else {
            onChange(field, next || null, true)
          }
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
        data={options}
        style={{ minWidth: width ?? 120 }}
        onFocus={() => { isFocused.current = true }}
        onBlur={() => {
          isFocused.current = false
          onBlur?.(selectValue)
        }}
      />
    )
  }

  // only enforce the character limit on plain text fields
  // numbers and dates have their own natural constraints
  const isTextField = type === 'text'
  const isOverLimit = isTextField && localValue.length > MAX_CELL_LENGTH
  const showCounter = isTextField && localValue.length >= COUNTER_SHOW_THRESHOLD

  return (
    <Stack gap={2}>
      <TextInput
        size="xs"
        type={type}
        value={localValue}
        disabled={disabled}
        // maxLength set to limit+1 so the user can see the "over limit" state
        // rather than being hard-stopped with no feedback
        maxLength={isTextField ? MAX_CELL_LENGTH + 1 : undefined}
        error={isOverLimit}
        onChange={(e) => {
          const raw = e.target.value
          setLocalValue(raw)
          // number fields send null instead of empty string when cleared
          if (type === 'number') {
            onChange(field, raw ? Number(raw) : null, false)
          } else {
            onChange(field, raw || '', false)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // block Enter if the text is over the limit so the user can't save bad data
            if (isOverLimit) return
            onEnter?.()
          }
        }}
        onFocus={() => { isFocused.current = true }}
        onBlur={(e) => {
          isFocused.current = false
          onBlur?.(e.target.value)
        }}
        style={{ minWidth: width ?? 100 }}
        autoComplete="off"
        placeholder={placeholder}
      />

      {/* character counter - only shown near/over the limit for text fields */}
      {showCounter && (
        <Text
          size="xs"
          ta="right"
          c={isOverLimit ? 'red' : 'dimmed'}
          style={{ lineHeight: 1, paddingRight: 2 }}
        >
          {localValue.length}/{MAX_CELL_LENGTH}
          {isOverLimit && ' — too long'}
        </Text>
      )}
    </Stack>
  )
}