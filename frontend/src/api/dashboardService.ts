import api from './axios'

// These types match exactly what Laravel returns
export interface CiPerCategory {
  category:       string
  total:          number
  active:         number
  decommissioned: number
  eol:            number
}

export interface StatusCount {
  label: string      // e.g. "Active", "EOL"
  total: number
}

export interface DashboardData {
  total_cis:       number
  ci_per_category: CiPerCategory[]
  ci_per_status:   StatusCount[]
  // (backend also returns criticality, environment etc.
  //  but we only need these 3 for now)
}

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get('/dashboard')
    return data.data  // ← Laravel wraps in { success: true, data: {...} }
  },
}