import api from './axios'

export interface ChangeLog {
  change_log_id:      string
  ci_id:              string
  ci_name:            string
  ci_table:           string
  change_type:        'Created' | 'Updated' | 'Deleted' | 'Restored'
  change_description: string | null
  change_by:          string
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

// change log service for fetching and creating change log entries
export const changeLogService = {

  // fetches a paginated list of change logs with optional search, filter, and sort
  async list(params?: ChangeLogListParams): Promise<PaginatedChangeLogs> {
    const { data } = await api.get<PaginatedChangeLogs>('/change-logs', { params })
    return data
  },

  // fetches a single change log entry by its ID
  async get(changeLogId: string): Promise<ChangeLog> {
    const { data } = await api.get<ChangeLog>(`/change-logs/${changeLogId}`)
    return data
  },

  // creates a new change log entry (called automatically after CI create/update/delete)
  async create(payload: ChangeLogPayload): Promise<ChangeLog> {
    const { data } = await api.post<ChangeLog>('/change-logs', payload)
    return data
  },

}