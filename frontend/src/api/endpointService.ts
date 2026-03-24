import api from './axios'

export interface Endpoints {
  [key: string]:      unknown
  ci_id:              string
  ci_name:            string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  ci_type:            string | null
  environment:        'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover' | null
  hostname:           string | null
  ip_address:         string | null
  operating_system:   string | null
  os_version:         string | null
  patch_level:        string | null
  assigned_user:      string | null
  employee_id:        string | null
  department:         string | null
  location_flr:       string | null
  manufacturer:       string | null
  model:              string | null
  serial_number:      string | null
  asset_tag:          string | null
  cpu:                string | null
  ram:                number
  storage:            number
  encryption:         string | null
  mdm_enrolled:       boolean
  edr_agent:          boolean
  antivirus:          boolean
  last_login:         string | null
  purchase_date:      string | null
  warranty_expiry:    string | null
  eol_date:           string | null
  notes:              string | null
  created_at:         string
  updated_at:         string
}

export type EndpointsPayload = Omit<Endpoints, 'ci_id' | 'created_at' | 'updated_at'>

export interface EndpointsListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedEndpoints {
  data:         Endpoints[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const endpointService = {
  async list(params?: EndpointsListParams): Promise<PaginatedEndpoints> {
    const { data } = await api.get<PaginatedEndpoints>('/endpoints', { params })
    return data
  },
  async get(ciId: string): Promise<Endpoints> {
    const { data } = await api.get<Endpoints>(`/endpoints/${ciId}`)
    return data
  },
  async create(payload: EndpointsPayload): Promise<Endpoints> {
    const { data } = await api.post<Endpoints>('/endpoints', payload)
    return data
  },
  async update(ciId: string, payload: Partial<EndpointsPayload>): Promise<Endpoints> {
    const { data } = await api.put<Endpoints>(`/endpoints/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/endpoints/${ciId}`)
  },
  async restore(ciId: string): Promise<Endpoints> {
    const { data } = await api.post<Endpoints>(`/endpoints/${ciId}/restore`)
    return data
  },
}