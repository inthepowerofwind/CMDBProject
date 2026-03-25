import api from './axios'

export interface CiPerCategory {
  category:       string
  total:          number
  active:         number
  decommissioned: number
  eol:            number
}

export interface StatusCount {
  label: string
  total: number
}

export interface DashboardData {
  total_cis:       number
  ci_per_category: CiPerCategory[]
  ci_per_status:   StatusCount[]
  total_archive:   number
}

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get('/dashboard')
    return data.data
  },
}