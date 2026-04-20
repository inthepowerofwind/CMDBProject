import React from 'react'

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface CIColumnDef<T> {
  key: keyof T & string
  header: string
  type?: FieldType
  options?: string[]
  render?: (value: unknown, row: T) => React.ReactNode
  width?: number
  readOnly?: boolean
  onBlur?: (value: unknown, formValues: Partial<T>, setFormValues: React.Dispatch<React.SetStateAction<Partial<T>>>) => void
  disabled?: boolean
  placeholder?: string
}

export interface CIService<T, P> {
  list: (params: {
    page: number
    per_page: number
    search?: string
    status?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
    archived?: boolean
  }) => Promise<{ data: T[]; total: number; last_page: number }>
  create:   (payload: P) => Promise<T>
  update:   (id: string, payload: P) => Promise<T>
  delete:   (id: string) => Promise<void>
  archive?: (id: string) => Promise<T>
  restore?: (id: string) => Promise<T>
}

export interface CITableProps<
  T extends object,
  P extends object
> {
  idField:            keyof T & string
  columns:            CIColumnDef<T>[]
  service:            CIService<T, P>
  emptyForm:          () => P
  statusOptions?:     string[]
  booleanFields?:     string[]
  addLabel?:          string
  searchPlaceholder?: string
  requiredFields?:    (keyof P & string)[]
  tableMinWidth?:     number
  requiredLabels?:    Record<string, string>
  //
   cellOverride?: (
    col:          CIColumnDef<T>,
    rowId:        string,
    currentVal:   unknown,
    formSnapshot: Partial<T & P> | undefined,
    setField:     (key: string, value: unknown, rerender?: boolean) => void,
    onEnter:      (() => void) | undefined,
  ) => React.ReactNode | null | undefined
}

/**
   * Optional escape hatch for rendering custom edit cells.
   *
   * Called for every editable cell in both the grid-edit rows and the
   * inline add row. Return a ReactNode to override the default EditableCell,
   * or return null/undefined to fall through to the default rendering.
   *
   * @param col          - The column definition
   * @param rowId        - String row ID, or '__new__' for the add row
   * @param currentVal   - Current form value for this cell
   * @param formSnapshot - Full current form for this row (read-only snapshot)
   * @param setField     - Update a field: setField(key, value, rerender?)
   * @param onEnter      - Call when Enter should trigger save
   */