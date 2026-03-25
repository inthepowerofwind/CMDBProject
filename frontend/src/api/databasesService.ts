import api from './axios'

export interface Databases {
  [key: string]:      unknown
  ci_id:              string
  database_name:      string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  db_type:            string | null
  version:            string | null
  environment:        'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover' | null
  host_server:        string | null
  ip_address:         string | null
  port:               string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low' | null
  data_classification: 'Internal' | 'External' | 'Confidential'
  size:               number
  backup_enabled:     boolean
  backup_frequency:   string | null
  last_backup:        string | null
  encryption_at_rest: boolean
  tde_enabled:        boolean
  access_control:     boolean
  monitoring_siem:    boolean
  patch_level:        string | null
  eol_date:           string | null
  db_owner:           string | null
  business_application: string | null
  last_review:        string | null
  notes:              string | null
  created_at:         string
  updated_at:         string
}

export type DatabasesPayload = Omit<Databases, 'ci_id' | 'created_at' | 'updated_at'>

export interface DatabasesListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedDatabase {
  data:         Databases[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const databasesService = {
  async list(params?: DatabasesListParams): Promise<PaginatedDatabase> {
    const { data } = await api.get<PaginatedDatabase>('/databases', { params })
    return data
  },
  async get(ciId: string): Promise<Databases> {
    const { data } = await api.get<Databases>(`/databases/${ciId}`)
    return data
  },
  async create(payload: DatabasesPayload): Promise<Databases> {
    const { data } = await api.post<Databases>('/databases', payload)
    return data
  },
  async update(ciId: string, payload: Partial<DatabasesPayload>): Promise<Databases> {
    const { data } = await api.put<Databases>(`/databases/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/databases/${ciId}`)
  },
  async restore(ciId: string): Promise<Databases> {
    const { data } = await api.post<Databases>(`/databases/${ciId}/restore`)
    return data
  },
}