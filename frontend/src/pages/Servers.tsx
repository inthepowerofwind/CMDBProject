import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { serverService, Server, ServerPayload } from '../api/serverService'

const STATUS_COLOR: Record<string, string> = {
  Active: 'green', 
  Decommissioned: 'gray', 
  EOL: 'red',
  'In Procurement': 'orange', 
  'In Deployment': 'blue', 
  Maintenance: 'yellow',
}

const CRIT_COLOR: Record<string, string> = {
  Critical: 'red', 
  High: 'orange', 
  Medium: 'yellow', 
  Low: 'blue',
}
const STATUS_OPTIONS = ['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']

const badge = (colorMap: Record<string,string>) => (value: unknown) =>
  value
    ? <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{value as string}</Badge>
    : null

const COLUMNS: CIColumnDef<Server>[] = [
  { key: 'ci_id',             header: 'CI ID',                     readOnly: true },
  { key: 'ci_name',           header: 'CI Name',                   type: 'text',   width: 140 },
  { key: 'status',            header: 'Status',                    type: 'select', width: 180, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'ci_type',           header: 'CI Type',                   type: 'text' },
  { key: 'environment',       header: 'Environment',               type: 'select', width: 160, options: ['Production','Staging','Testing / QA','Development','DR / Failover'] },
  { key: 'hostname',          header: 'Hostname / IP Address',     type: 'text',   width: 150 },
  { key: 'operating_system',  header: 'Operating System',          type: 'text',   width: 140 },
  { key: 'os_version',        header: 'OS Version',                type: 'text' },
  { key: 'patch_level',       header: 'Patch Level',               type: 'text' },
  { key: 'cpu_cores',         header: 'CPU Cores',                 type: 'number', width: 90 },
  { key: 'ram_gb',            header: 'RAM (GB)',                  type: 'number', width: 90 },
  { key: 'storage_tb',        header: 'Storage (TB)',              type: 'number', width: 100 },
  { key: 'virtualized',       header: 'Virtualized',               type: 'boolean',width: 90 },
  { key: 'location',          header: 'Location / Data Center',    type: 'text',   width: 160 },
  { key: 'rack_slot',         header: 'Rack / Slot',               type: 'text' },
  { key: 'criticality',       header: 'Criticality',               type: 'select', width: 120, options: ['Critical','High','Medium','Low'], render: badge(CRIT_COLOR) },
  { key: 'business_service',  header: 'Business Service',          type: 'text',   width: 140 },
  { key: 'assigned_owner',    header: 'Assigned Owner',            type: 'text',   width: 140 },
  { key: 'department',        header: 'Department',                type: 'text' },
  { key: 'manufacturer',      header: 'Manufacturer',              type: 'text' },
  { key: 'model',             header: 'Model',                     type: 'text' },
  { key: 'serial_number',     header: 'Serial Number',             type: 'text',   width: 130 },
  { key: 'asset_tag',         header: 'Asset Tag',                 type: 'text' },
  { key: 'purchase_date',     header: 'Purchase Date',             type: 'date',   width: 140 },
  { key: 'warranty_expiry',   header: 'Warranty Expiry',           type: 'date',   width: 140 },
  { key: 'eol_date',          header: 'EOL Date',                  type: 'date',   width: 140 },
  { key: 'last_config_review',header: 'Last Configuration Review', type: 'date',   width: 160 },
  { key: 'baseline_applied',  header: 'Baseline Applied',          type: 'boolean',width: 110 },
  { key: 'backup_enabled',    header: 'Backup Enabled',            type: 'boolean',width: 110 },
  { key: 'monitoring_siem',   header: 'Monitoring (SIEM)',         type: 'boolean',width: 120 },
  { key: 'notes',             header: 'Notes',                     type: 'text',   width: 200 },
]

const emptyServerForm = (): ServerPayload => ({
  ci_name: '', 
  status: 'Active', 
  ci_type: null, 
  environment: 'Production',
  hostname: null, 
  operating_system: null, 
  os_version: null, 
  patch_level: null,
  cpu_cores: null, 
  ram_gb: null, 
  storage_tb: null, 
  virtualized: false,
  location: null, 
  rack_slot: null, 
  criticality: 'Medium', 
  business_service: null,
  assigned_owner: null, 
  department: null, 
  manufacturer: null, 
  model: null,
  serial_number: null, 
  asset_tag: null, 
  purchase_date: null, 
  warranty_expiry: null,
  eol_date: null, 
  last_config_review: null, 
  baseline_applied: false,
  backup_enabled: false, 
  monitoring_siem: false, 
  notes: null,
})

export default function Servers() {
  return (
    <CITable<Server, ServerPayload>
      idField="ci_id"
      columns={COLUMNS}
      service={serverService}
      emptyForm={emptyServerForm}
      statusOptions={STATUS_OPTIONS}
      booleanFields={['virtualized','baseline_applied','backup_enabled','monitoring_siem']}
      addLabel="Add Server"
      searchPlaceholder="Search by ID, name, OS..."
    />
  )
}