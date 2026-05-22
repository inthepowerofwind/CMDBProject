import api from './axios'

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

type BackendData = Record<string, Record<string, string>[]>

interface ColumnMeta {
  title:   string
  columns: string[]
  fields:  string[]
}

// default reference table metadata - defines the display columns and backend field names
// for each lookup table shown in the Reference module
export const TABLE_META: Record<string, ColumnMeta> = {
  ci_status: {
    title:   'CI Status Values',
    columns: ['Status Code', 'Description', 'Allowed in Production', 'Color Code'],
    fields:  ['status_code', 'description', 'allowed_in_production', 'color_code'],
  },
  criticality_levels: {
    title:   'CI Criticality Levels',
    columns: ['Criticality', 'Definition', 'RTO Target', 'Review Frequency'],
    fields:  ['criticality', 'definition', 'rto_target', 'review_frequency'],
  },
  environments: {
    title:   'CI Environment Values',
    columns: ['Environment', 'Description', 'Live Data Allowed', 'Change Approval Required'],
    fields:  ['environment', 'description', 'live_data_allowed', 'change_approval_required'],
  },
  data_classifications: {
    title:   'Data Classification',
    columns: ['Classification', 'Description', 'Encryption Required', 'External Sharing'],
    fields:  ['classification', 'description', 'encryption_required', 'external_sharing'],
  },
  relationship_types: {
    title:   'Relationship Types',
    columns: ['Relationship Type', 'Description'],
    fields:  ['relationship_type', 'description'],
  },
}

// maps a backend row (field names) to a frontend row (display column names)
function toFrontendRow(
  backendRow: Record<string, string>,
  meta: ColumnMeta,
  index: number,
): ReferenceRow {
  const row: ReferenceRow = { id: String(index) }
  meta.columns.forEach((col, i) => {
    row[col] = backendRow[meta.fields[i]] ?? ''
  })
  return row
}

// maps a frontend row (display column names) back to a backend row (field names)
function toBackendRow(
  frontendRow: ReferenceRow,
  meta: ColumnMeta,
): Record<string, string> {
  const row: Record<string, string> = {}
  meta.columns.forEach((col, i) => {
    row[meta.fields[i]] = frontendRow[col] ?? ''
  })
  return row
}

// transforms the full backend response into the ReferenceTable array used by the UI
function transformResponse(data: BackendData): ReferenceTable[] {
  return Object.entries(TABLE_META).map(([tableKey, meta]) => ({
    id:      tableKey,
    title:   meta.title,
    columns: meta.columns,
    rows:    (data[tableKey] ?? []).map((row, i) => toFrontendRow(row, meta, i)),
  }))
}

// reference service for fetching and updating lookup table data
const referenceService = {

  // fetches all reference tables and transforms them into frontend-friendly format
  async getAll(): Promise<ReferenceTable[]> {
    const { data } = await api.get<BackendData>('/reference')
    return transformResponse(data)
  },

  // replaces all rows in a table with the current frontend rows
  async replaceTable(tableId: string, rows: ReferenceRow[]): Promise<void> {
    const meta = TABLE_META[tableId]
    await api.put(`/reference/${tableId}`, {
      rows: rows.map((r) => toBackendRow(r, meta)),
    })
  },

  // adds a single new row to a reference table
  async addRow(tableId: string, row: ReferenceRow): Promise<void> {
    const meta = TABLE_META[tableId]
    await api.post(`/reference/${tableId}/rows`, toBackendRow(row, meta))
  },

  // deletes a row from a reference table by its index
  async deleteRow(tableId: string, index: number): Promise<void> {
    await api.delete(`/reference/${tableId}/rows/${index}`)
  },
}

export default referenceService