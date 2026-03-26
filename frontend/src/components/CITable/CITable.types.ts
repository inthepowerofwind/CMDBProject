export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

export interface CIColumnDef<T> {
  key: keyof T & string
  header: string
  type?: FieldType
  options?: string[]
  render?: (value: unknown, row: T) => React.ReactNode
  width?: number
  readOnly?: boolean
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
}