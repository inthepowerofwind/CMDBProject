import api from './axios'

export interface Relationships {
  [key: string]:      unknown
  relationship_id:    string
  source_ci_id:       string
  source_ci_name:     string
  source_ci_table:    string
  target_ci_table:    string
  relationship_type:  string
  version:            string
  target_ci_id:       string
  target_ci_name:     string
  description:        string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low'
  created_at:         string
  updated_at:         string
}

export type RelationshipsPayload = Omit<Relationships, 'relationship_id' | 'created_at' | 'updated_at'>

export interface RelationshipsListParams {
  search?:   string
  status?:   string
  sort_by?:  string
  sort_dir?: 'asc' | 'desc'
  page?:     number
  per_page?: number
  archived?: boolean
}

export interface PaginatedRelationships {
  data:         Relationships[]
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
}

export const relationshipService = {
  async list(params?: RelationshipsListParams): Promise<PaginatedRelationships> {
    const { data } = await api.get<PaginatedRelationships>('/ci-relationships', { params })
    return data
  },
  async get(ciId: string): Promise<Relationships> {
    const { data } = await api.get<Relationships>(`/ci-relationships/${ciId}`)
    return data
  },
  async create(payload: RelationshipsPayload): Promise<Relationships> {
    const { data } = await api.post<Relationships>('/ci-relationships', payload)
    return data
  },
  async update(ciId: string, payload: Partial<RelationshipsPayload>): Promise<Relationships> {
    const { data } = await api.put<Relationships>(`/ci-relationships/${ciId}`, payload)
    return data
  },
  async delete(ciId: string): Promise<void> {
    await api.delete(`/ci-relationships/${ciId}`)
  },
  async restore(ciId: string): Promise<Relationships> {
    const { data } = await api.post<Relationships>(`/ci-relationships/${ciId}/restore`)
    return data
  },
}