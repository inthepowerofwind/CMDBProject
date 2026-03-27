export interface ReferenceRow {
  id: string
  [key: string]: string
}

export interface ReferenceTable {
  id: string
  title: string
  columns: string[]
  rows: ReferenceRow[]
}