import api from './axios'

export interface CloudServices {
  [key: string]:      unknown
  ci_id:              string
  service_name:       string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  service_type:       string | null
  cloud_model:        string | null
  provider:           string | null
  region:             string | null
  service_tier:       string | null
  account_id:         string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low'
  data_classification: 'Internal' | 'External' | 'Confidential'
  monthly_cost:       string | null
  sla_uptime:         string | null
  mfa_enforced:       boolean
  sso_integrated:     boolean
  encryption_at_rest: boolean
  encryption_in_transit: boolean
  dlp_monitored:      boolean
  logging_to_siem:    boolean
  soc2_certified:     boolean
  contract_expiry:    string | null
  shared_responsibility: boolean
  business_owner:     string | null
  it_owner:           string | null
  last_security_review: string | null
  notes:              string | null
  created_at:         string
  updated_at:         string
}

export type CloudServicesPayload = Omit<CloudServices, 'ci_id' | 'created_at' | 'updated_at'>

export interface CloudServicesListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedCloudServices {
  data:         CloudServices[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const cloud_servicesService = {
  async list(params?: CloudServicesListParams): Promise<PaginatedCloudServices> {
    const { data } = await api.get<PaginatedCloudServices>('/cloud-services', { params })
    return data
  },
  async get(ciId: string): Promise<CloudServices> {
    const { data } = await api.get<CloudServices>(`/cloud-services/${ciId}`)
    return data
  },
  async create(payload: CloudServicesPayload): Promise<CloudServices> {
    const { data } = await api.post<CloudServices>('/cloud-services', payload)
    return data
  },
  async update(ciId: string, payload: Partial<CloudServicesPayload>): Promise<CloudServices> {
    const { data } = await api.put<CloudServices>(`/cloud-services/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/cloud-services/${ciId}`)
  },
  async restore(ciId: string): Promise<CloudServices> {
    const { data } = await api.post<CloudServices>(`/cloud-services/${ciId}/restore`)
    return data
  },
}