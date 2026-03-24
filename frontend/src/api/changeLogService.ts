import api from './axios'

export interface ChangeLog {
  change_log_id:      string
  ci_id:              string
  ci_name:            string
  ci_table:           string
  change_type:        'Created' | 'Updated' | 'Deleted' | 'Restored'
  change_description: string | null
  change_by:          string
  rfs_reference:      string | null
  approved_by:        string | null
  previous_values:    Record<string, unknown> | null
  new_values:         Record<string, unknown> | null
  created_at:         string
  updated_at:         string
}

export type ChangeLogPayload = {
  ci_id:              string
  ci_name:            string
  ci_table:           string
  change_type:        string
  change_description: string | null
  change_by:          string
  rfs_reference:      string | null
  approved_by:        string | null
  previous_values:    Record<string, unknown> | null
  new_values:         Record<string, unknown> | null
}

export interface ChangeLogListParams {
  search?:      string
  change_type?: string
  ci_id?:       string
  ci_table?:    string
  sort_by?:     string
  sort_dir?:    'asc' | 'desc'
  page?:        number
  per_page?:    number
}

export interface PaginatedChangeLogs {
  data:         ChangeLog[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

// ── Service ───────────────────────────────────────────────────────────────────

export const changeLogService = {

  async list(params?: ChangeLogListParams): Promise<PaginatedChangeLogs> {
    const { data } = await api.get<PaginatedChangeLogs>('/change-logs', { params })
    return data
  },

  async get(changeLogId: string): Promise<ChangeLog> {
    const { data } = await api.get<ChangeLog>(`/change-logs/${changeLogId}`)
    return data
  },

  async create(payload: ChangeLogPayload): Promise<ChangeLog> {
    const { data } = await api.post<ChangeLog>('/change-logs', payload)
    return data
  },

}