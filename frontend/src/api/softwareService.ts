import api from './axios'

export interface Software {
  [key: string]:      unknown
  ci_id:              string
  software_name:      string
  status:             'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  software_type:      string | null
  version:            string | null
  vendor:             string | null
  license_type:       string | null
  license_count:      string | null
  license_deployed:   string | null
  license_available:  string | null
  compliance_status:  'Compliant' | 'At Limit'
  installed_on:       string | null
  environment:        'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover' 
  criticality:        'Critical' | 'High' | 'Medium' | 'Low'
  data_classification: 'Internal' | 'External' | 'Confidential'
  auto_update:        boolean
  asl_approved:       boolean
  sast_dast_tested:   'Yes' | 'No' | 'N/A'
  license_key_loc:    string | null
  procurement_date:   string | null
  license_expiry:     string | null
  eol_date:           string | null
  last_review:        string | null
  notes:              string | null
  created_at:         string
  updated_at:         string
}

export type SoftwarePayload = Omit<Software, 'ci_id' | 'created_at' | 'updated_at'>

export interface SoftwareListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedSoftware {
  data:         Software[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const softwareService = {
  async list(params?: SoftwareListParams): Promise<PaginatedSoftware> {
    const { data } = await api.get<PaginatedSoftware>('/software', { params })
    return data
  },
  async get(ciId: string): Promise<Software> {
    const { data } = await api.get<Software>(`/software/${ciId}`)
    return data
  },
  async create(payload: SoftwarePayload): Promise<Software> {
    const { data } = await api.post<Software>('/software', payload)
    return data
  },
  async update(ciId: string, payload: Partial<SoftwarePayload>): Promise<Software> {
    const { data } = await api.put<Software>(`/software/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/software/${ciId}`)
  },
  async restore(ciId: string): Promise<Software> {
    const { data } = await api.post<Software>(`/software/${ciId}/restore`)
    return data
  },
}