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
// CI Options
export interface CiOption {
  ci_id:    string
  ci_name:  string
  category: string
}

// relationship service for CRUD, archive/restore, and CI lookup operations
export const relationshipService = {

  // fetches a paginated list of relationships with optional search, filter, and sort
  async list(params?: RelationshipsListParams): Promise<PaginatedRelationships> {
    const { data } = await api.get<PaginatedRelationships>('/ci-relationships', { params })
    return data
  },

  // fetches a single relationship record by ID
  async get(ciId: string): Promise<Relationships> {
    const { data } = await api.get<Relationships>(`/ci-relationships/${ciId}`)
    return data
  },

  // creates a new relationship record
  async create(payload: RelationshipsPayload): Promise<Relationships> {
    const { data } = await api.post<Relationships>('/ci-relationships', payload)
    return data
  },

  // updates an existing relationship record by ID
  async update(ciId: string, payload: Partial<RelationshipsPayload>): Promise<Relationships> {
    const { data } = await api.put<Relationships>(`/ci-relationships/${ciId}`, payload)
    return data
  },

  // soft-deletes a relationship record (moves it to the archive)
  async delete(ciId: string): Promise<void> {
    await api.delete(`/ci-relationships/${ciId}`)
  },

  // restores a soft-deleted relationship record back to the main table
  async restore(ciId: string): Promise<Relationships> {
    const { data } = await api.post<Relationships>(`/ci-relationships/${ciId}/restore`)
    return data
  },

  // looks up a single CI by ID to retrieve its name; returns null if not found
  async lookupCi(ciId: string): Promise<{ ci_id: string; ci_name: string } | null> {
    try {
      const { data } = await api.get<{ ci_id: string; ci_name: string }>(`/ci-lookup/${ciId}`)
      return data
    } catch {
      return null
    }
  },

  // fetches all CI IDs and names, optionally filtered by category
  // used to populate the Source / Target CI ID dropdowns in the Relationships module
  async listCis(category?: string): Promise<CiOption[]> {
    const params = category ? { category } : {}
    const { data } = await api.get<string[]>('/ci-list', { params })
    return data.map((id) => ({ ci_id: id, ci_name: '', category: category ?? '' }))
  },
}