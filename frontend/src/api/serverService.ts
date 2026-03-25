import api from './axios'
  
export interface Server {
  [key: string]:      unknown
  ci_id:              string
  ci_name:            string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  ci_type:            string | null
  environment:        'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover' | null
  hostname:           string | null
  operating_system:   string | null
  os_version:         string | null
  patch_level:        string | null
  cpu_cores:          number | null
  ram_gb:             number | null
  storage_tb:         number | null
  virtualized:        boolean
  location:           string | null
  rack_slot:          string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low' | null
  business_service:   string | null //waley sa CIObserver
  assigned_owner:     string | null
  department:         string | null
  manufacturer:       string | null
  model:              string | null
  serial_number:      string | null
  asset_tag:          string | null
  purchase_date:      string | null
  warranty_expiry:    string | null
  eol_date:           string | null
  last_config_review: string | null
  baseline_applied:   boolean
  backup_enabled:     boolean
  monitoring_siem:    boolean
  notes:              string | null
  created_at:         string
  updated_at:         string
}
 
export type ServerPayload = Omit<Server, 'ci_id' | 'created_at' | 'updated_at'>
 
export interface ServerListParams {
  search?: string
  status?: string
  environment?: string
  criticality?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
 
export interface PaginatedServers {
  data: Server[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const serverService = {
  async list(params?: ServerListParams): Promise<PaginatedServers> {
    const { data } = await api.get<PaginatedServers>('/servers', { params })
    return data
  },
 
  async get(ciId: string): Promise<Server> {
    const { data } = await api.get<Server>(`/servers/${ciId}`)
    return data
  },
 
  async create(payload: ServerPayload): Promise<Server> {
    const { data } = await api.post<Server>('/servers', payload)
    return data
  },
 
  async update(ciId: string, payload: Partial<ServerPayload>): Promise<Server> {
    const { data } = await api.put<Server>(`/servers/${ciId}`, payload)
    return data
  },
 
  async delete(ciId: string): Promise<void> {
    await api.delete(`/servers/${ciId}`)
  },
 
  async restore(ciId: string): Promise<Server> {
    const { data } = await api.post<Server>(`/servers/${ciId}/restore`)
    return data
  },
 
  async forceDelete(ciId: string): Promise<void> {
    await api.delete(`/servers/${ciId}/force`)
  },
}
 