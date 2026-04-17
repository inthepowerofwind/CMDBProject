import api from './axios'

export interface Relationships {
  [key: string]:      unknown
  relationship_id:    string
  source_ci_category: string
  source_ci_id:       string
  source_ci_name:     string
  relationship_type:  'Runs On / Hosted By' | 'Uses / Depends On' | 'Hosts / Virtualizes' | 'Backed Up By'
                      | 'Replicates To' | 'HA Pair' | 'Protects / Fronts' | 'Load Balances' | 'Contains PII For'
  target_ci_category: string
  target_ci_id:       string
  target_ci_name:     string
  description:        string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low'
  created_at:         string
  updated_at:         string
}

export interface RelationshipsPayload {
  source_ci_id:       string
  source_ci_category: string
  source_ci_name:     string
  relationship_type:  string
  target_ci_category: string
  target_ci_id:       string
  target_ci_name:     string
  description:        string | null
  criticality:        'Critical' | 'High' | 'Medium' | 'Low'
}

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

//
export interface CiOption {
  ci_id:    string
  ci_name:  string
  category: string
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
  async lookupCi(ciId: string): Promise<{ ci_id: string; ci_name: string } | null> {
    try {
      const { data } = await api.get<{ ci_id: string; ci_name: string }>(`/ci-lookup/${ciId}`)
      return data
    } catch {
      return null
    }
  },

  //Fetch all CI IDs + names, optionally filtered by category.
  //Used to populate the Source / Target CI ID dropdowns.
  async listCis(category?: string): Promise<CiOption[]> {
    const params = category ? { category } : {}
    const { data } = await api.get<string[]>('/ci-list', { params })
    return data.map((id) => ({ ci_id: id, ci_name: '', category: category ?? '' }))
  },
}