export interface CISummaryRow {
  category: string
  total: number
  active: number
  decommissioned: number
  eolAtRisk: number
}

export interface Server {
  id: string
  name: string
  status: 'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' |
  'In Deployment' | 'Maintenance'
  ciType: string
  environment: string
  ipAddress: string
  os: string
  osVersion: string
  patchLevel: string
  cpuCores: number
  ram: number
  storage: number
  virtualized: string
  location: string
  rackSlot: string
  criticality: string
  businessService: string
  assignedOwner: string
  department: string
  manufacturer: string
  model: string
  serialNumber: string
  assetTag: string
  purchaseDate: string
  warrantyExpiry: string
  eolDate: string
  lastConfigReview: string
  baselineApplied: string
  backupEnabled: string
  monitoringSiem: string
  notes: string
}

export const ciSummary: CISummaryRow[] = [
  { category: 'Server',         total: 10, active: 9, decommissioned: 0, eolAtRisk: 1 },
  { category: 'Network Device', total: 8,  active: 8, decommissioned: 0, eolAtRisk: 0 },
  { category: 'Endpoint',       total: 8,  active: 7, decommissioned: 0, eolAtRisk: 1 },
  { category: 'Software',       total: 10, active: 9, decommissioned: 0, eolAtRisk: 1 },
  { category: 'Cloud Service',  total: 8,  active: 7, decommissioned: 1, eolAtRisk: 0 },
  { category: 'Database',       total: 7,  active: 6, decommissioned: 0, eolAtRisk: 1 },
]

export const servers: Server[] = [
  {
    id: 'SRV-001', name: 'DC01-PROD', status: 'Active',
    ciType: 'Domain Controller', environment: 'Production',
    ipAddress: '10.0.1.10', os: 'Windows Server', osVersion: '2022 Datacenter',
    patchLevel: 'Fully Patched', cpuCores: 8, ram: 32, storage: 2,
    virtualized: 'No', location: 'DC1 – Primary Site', rackSlot: 'Rack A / U4',
    criticality: 'Critical', businessService: 'Active Directory',
    assignedOwner: 'IT Operations', department: 'IT',
    manufacturer: 'Dell', model: 'PowerEdge R750',
    serialNumber: 'SN-DELL-001', assetTag: 'TAG-SRV-001',
    purchaseDate: '2022-03-15', warrantyExpiry: '2027-03-15',
    eolDate: '2027-03-15', lastConfigReview: '2026-02-01',
    baselineApplied: 'Yes', backupEnabled: 'Yes', monitoringSiem: 'Yes',
    notes: 'Primary domain controller',
  },
  {
    id: 'SRV-002', name: 'DC02-PROD', status: 'Active',
    ciType: 'Domain Controller', environment: 'Production',
    ipAddress: '10.0.1.11', os: 'Windows Server', osVersion: '2022 Datacenter',
    patchLevel: 'Fully Patched', cpuCores: 8, ram: 32, storage: 2,
    virtualized: 'No', location: 'DC2 – DR Site', rackSlot: 'Rack B / U4',
    criticality: 'Critical', businessService: 'Active Directory',
    assignedOwner: 'IT Operations', department: 'IT',
    manufacturer: 'Dell', model: 'PowerEdge R750',
    serialNumber: 'SN-DELL-002', assetTag: 'TAG-SRV-002',
    purchaseDate: '2022-03-15', warrantyExpiry: '2027-03-15',
    eolDate: '2027-03-15', lastConfigReview: '2026-02-01',
    baselineApplied: 'Yes', backupEnabled: 'Yes', monitoringSiem: 'Yes',
    notes: 'Secondary / failover DC',
  },
  {
    id: 'SRV-010', name: 'LEGACYSVR01', status: 'EOL',
    ciType: 'Application Server', environment: 'Production',
    ipAddress: '10.0.1.90', os: 'Windows Server', osVersion: '2012 R2',
    patchLevel: 'End of Life', cpuCores: 4, ram: 8, storage: 1,
    virtualized: 'No', location: 'DC1 – Primary Site', rackSlot: 'Rack F / U1',
    criticality: 'High', businessService: 'Legacy App',
    assignedOwner: 'IT Operations', department: 'Operations',
    manufacturer: 'Dell', model: 'PowerEdge R620',
    serialNumber: 'SN-DELL-010', assetTag: 'TAG-SRV-010',
    purchaseDate: '2014-05-01', warrantyExpiry: '2019-05-01',
    eolDate: '2023-10-10', lastConfigReview: '2025-12-01',
    baselineApplied: 'No', backupEnabled: 'Yes', monitoringSiem: 'Yes',
    notes: 'EOL – decommission by 2026-06-30',
  },
]