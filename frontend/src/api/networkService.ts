import api from './axios'

export interface NetworkDevice {
  [key: string]:      unknown
  ci_id:              string
  ci_name:            string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  ci_type:            string | null
  environment:        'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover' | null
  ip_address:         string | null
  mac_address:        string | null
  vlan_segment:       string | null
  ports_interfaces:   string | null
  firmware_version:   string | null
  patch_level:        string | null
  location:           string | null
  rack_position:      string | null
  redundancy:         string | null // waley sa CIObserver
  criticality:        'Critical' | 'High' | 'Medium' | 'Low' | null
  business_service:   string | null // waley sa CIObserver
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
  monitoring_siem:    boolean
  notes:              string | null
  created_at:         string
  updated_at:         string
}

export type NetworkPayload = Omit<NetworkDevice, 'ci_id' | 'created_at' | 'updated_at'>

export interface NetworkListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedNetwork {
  data:         NetworkDevice[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const networkService = {
  async list(params?: NetworkListParams): Promise<PaginatedNetwork> {
    const { data } = await api.get<PaginatedNetwork>('/network-devices', { params })
    return data
  },
  async get(ciId: string): Promise<NetworkDevice> {
    const { data } = await api.get<NetworkDevice>(`/network-devices/${ciId}`)
    return data
  },
  async create(payload: NetworkPayload): Promise<NetworkDevice> {
    const { data } = await api.post<NetworkDevice>('/network-devices', payload)
    return data
  },
  async update(ciId: string, payload: Partial<NetworkPayload>): Promise<NetworkDevice> {
    const { data } = await api.put<NetworkDevice>(`/network-devices/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/network-devices/${ciId}`)
  },
  async restore(ciId: string): Promise<NetworkDevice> {
    const { data } = await api.post<NetworkDevice>(`/network-devices/${ciId}/restore`)
    return data
  },
}