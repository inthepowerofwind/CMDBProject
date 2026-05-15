// All TypeScript types and interfaces for the CITable component system.
// Shared by CITable.tsx, TableView.tsx, TextDateCell.tsx, and EditableCell.tsx.

import React from 'react'

// Utility types

// Allows accessing typed row objects with a dynamic string key.
// Used internally by TableView and CITable when indexing row data
// by a runtime column key (e.g. row[col.key]).
export type Indexable<T> = T & { [key: string]: unknown }

// Column definition

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface CIColumnDef<T> {
  key:         keyof T & string
  header:      string
  type?:       FieldType
  options?:    string[]
  render?:     (value: unknown, row: T) => React.ReactNode
  width?:      number
  readOnly?:   boolean
  onBlur?:     (
    value:         unknown,
    formValues:    Partial<T>,
    setFormValues: React.Dispatch<React.SetStateAction<Partial<T>>>,
  ) => void
  disabled?:   boolean
  placeholder?: string
}

// Service interface

// The API service contract each CI module must implement.
// CITable uses this interface to remain generic across all modules.
export interface CIService<T, P> {
  list: (params: {
    page:       number
    per_page:   number
    search?:    string
    status?:    string
    sort_by?:   string
    sort_dir?:  'asc' | 'desc'
    archived?:  boolean
  }) => Promise<{ data: T[]; total: number; last_page: number }>
  create:   (payload: P) => Promise<T>
  update:   (id: string, payload: P) => Promise<T>
  delete:   (id: string) => Promise<void>
  archive?: (id: string) => Promise<T>
  restore?: (id: string) => Promise<T>
}

// CITable props

export interface CITableProps<T extends object, P extends object> {
  idField:             keyof T & string
  columns:             CIColumnDef<T>[]
  service:             CIService<T, P>
  emptyForm:           () => P
  statusOptions?:      string[]
  booleanFields?:      string[]
  addLabel?:           string
  searchPlaceholder?:  string
  requiredFields?:     (keyof P & string)[]
  tableMinWidth?:      number
  requiredLabels?:     Record<string, string>

  /**
   * Optional escape hatch for rendering custom edit cells.
   *
   * Called for every editable cell in both grid-edit rows and the inline add row.
   * Return a ReactNode to override the default EditableCell rendering,
   * or return null/undefined to fall through to the default.
   *
   * @param col          - The column definition for this cell
   * @param rowId        - String row ID, or '__new__' for the inline add row
   * @param currentVal   - The current form value for this cell
   * @param formSnapshot - Full current form for this row (read-only snapshot)
   * @param setField     - Update a field value: setField(key, value, rerender?)
   * @param onEnter      - Call this when Enter should trigger save
   */

  cellOverride?: (
    col:          CIColumnDef<T>,
    rowId:        string,
    currentVal:   unknown,
    formSnapshot: Partial<T & P> | undefined,
    setField:     (key: string, value: unknown, rerender?: boolean) => void,
    onEnter:      (() => void) | undefined,
  ) => React.ReactNode | null | undefined
}

