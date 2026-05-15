// A hybrid input cell for columns that accept either a typed date 
// (via a native date picker) or text

// Used by TableView for columns listed in TEXT_DATE_FIELDS (dateHelpers.ts),
// such as EOL Date and License Expiry.

import { useState, useEffect, useRef } from 'react'
import { TextInput, ActionIcon } from '@mantine/core'
import { IconCalendar, IconX } from '@tabler/icons-react'
import { isoToDisplay } from './dateHelpers'

// Props 
export interface TextDateCellProps {
  value:     unknown
  field:     string
  width?:    number
  disabled?: boolean
  onChange:  (field: string, value: unknown, rerender?: boolean) => void
  onEnter?:  () => void
}

// Component
export function TextDateCell({
  value,
  field,
  width,
  disabled,
  onChange,
  onEnter,
}: TextDateCellProps) {

  // Strips the time portion from ISO datetime strings so only the date remains.
  const stripTime = (v: unknown): string => {
    if (!v) return ''
    const s = String(v)
    return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.split('T')[0] : s
  }

  const [localValue, setLocalValue] = useState(stripTime(value))

  // Keep local state in sync when the parent value changes externally.
  useEffect(() => {
    setLocalValue(String(value ?? ''))
  }, [value])

  // Converts a YYYY-MM-DD date picker value to MM/DD/YYYY for display,
  // then pushes the change up to the parent form.
  const applyDate = (raw: string) => {
    const picked = raw ? isoToDisplay(raw) : ''
    setLocalValue(picked)
    onChange(field, picked, true)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange(field, '', true)
  }

  // Ref to the hidden native <input type="date"> behind the calendar icon.
  // Attach a native 'input' listener (not React's onChange) so the picker
  // can be reopened even if the same date is selected again (value resets after each pick).
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = dateInputRef.current
    if (!el) return
    const onNativeInput = (e: Event) => {
      applyDate((e.target as HTMLInputElement).value)
      ;(e.target as HTMLInputElement).value = ''
    }
    el.addEventListener('input', onNativeInput)
    return () => el.removeEventListener('input', onNativeInput)
  }, [field]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextInput
      size="xs"
      value={localValue}
      disabled={disabled}
      placeholder="mm/dd/yyyy or text"
      onChange={(e) => {
        const v = e.target.value
        setLocalValue(v)
        onChange(field, v, true)
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
      rightSectionWidth={localValue ? 44 : 24}
      rightSection={
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Clear button - only shown when the field has a value */}
          {localValue && !disabled && (
            <ActionIcon
              size={14}
              variant="transparent"
              color="gray"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              style={{ cursor: 'pointer', minWidth: 14 }}
            >
              <IconX size={10} />
            </ActionIcon>
          )}

          {/* Calendar icon with a hidden native date input layered behind it */}
          <div style={{
            position: 'relative', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCalendar size={13} style={{ color: '#868e96', pointerEvents: 'none' }} />
            <input
              ref={dateInputRef}
              type="date"
              disabled={disabled}
              tabIndex={-1}
              onChange={(e) => {
                applyDate(e.target.value)
                e.target.value = ''
              }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                colorScheme: 'light',
              }}
            />
          </div>
        </div>
      }
      style={{ width: width ?? 180 }}
    />
  )
}