import api from './axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferenceRow {
  id: string           // frontend-only, stripped before any API call
  [key: string]: string
}

export interface ReferenceTable {
  id: string
  title: string
  columns: string[]    // human-readable display labels
  rows: ReferenceRow[]
}

type BackendData = Record<string, Record<string, string>[]>

// ─── Column metadata ──────────────────────────────────────────────────────────

interface ColumnMeta {
  title:   string
  columns: string[]   // display labels
  fields:  string[]   // backend snake_case keys (same order as columns)
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function transformResponse(data: BackendData): ReferenceTable[] {
  return Object.entries(TABLE_META).map(([tableKey, meta]) => ({
    id:      tableKey,
    title:   meta.title,
    columns: meta.columns,
    rows:    (data[tableKey] ?? []).map((row, i) => toFrontendRow(row, meta, i)),
  }))
}

// ─── Service ──────────────────────────────────────────────────────────────────

const referenceService = {
  async getAll(): Promise<ReferenceTable[]> {
    const { data } = await api.get<BackendData>('/reference')
    return transformResponse(data)
  },

  async replaceTable(tableId: string, rows: ReferenceRow[]): Promise<void> {
    const meta = TABLE_META[tableId]
    await api.put(`/reference/${tableId}`, {
      rows: rows.map((r) => toBackendRow(r, meta)),
    })
  },

  async addRow(tableId: string, row: ReferenceRow): Promise<void> {
    const meta = TABLE_META[tableId]
    await api.post(`/reference/${tableId}/rows`, toBackendRow(row, meta))
  },

  async deleteRow(tableId: string, index: number): Promise<void> {
    await api.delete(`/reference/${tableId}/rows/${index}`)
  },

  async resetTable(tableId: string): Promise<void> {
    await api.delete(`/reference/${tableId}/reset`)
  },
}

export default referenceService