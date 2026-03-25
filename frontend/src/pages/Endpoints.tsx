import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { endpointService, Endpoints, EndpointsPayload } from '../api/endpointService'

const STATUS_COLOR: Record<string, string> = {
  Active: 'green', 
  Decommissioned: 'gray', 
  EOL: 'red',
  'In Procurement': 'orange', 
  'In Deployment': 'blue', 
  Maintenance: 'yellow',
}

const STATUS_OPTIONS = ['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']

const badge = (colorMap: Record<string, string>) => (value: unknown) =>
  value
    ? <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{value as string}</Badge>
    : null

const COLUMNS: CIColumnDef<Endpoints>[] = [
  { key: 'ci_id',             header: 'CI ID',                      readOnly: true },
  { key: 'ci_name',           header: 'CI Name',                    type: 'text',   width: 140 },
  { key: 'status',            header: 'Status',                     type: 'select', width: 180, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'ci_type',           header: 'CI Type',                    type: 'text' },
  { key: 'environment',       header: 'Environment',                type: 'select', width: 160, options: ['Production','Staging','Testing / QA','Development','DR / Failover'] },
  { key: 'hostname',          header: 'Hostname',                   type: 'text',   width: 150 },
  { key: 'ip_address',        header: 'IP Address (DHCP)',          type: 'text',   width: 150 },
  { key: 'operating_system',  header: 'Operating System',           type: 'text',   width: 140 },
  { key: 'os_version',        header: 'OS Version',                 type: 'text' },
  { key: 'patch_level',       header: 'Patch Level',                type: 'text' },
  { key: 'assigned_user',     header: 'Assigned User',              type: 'text' },
  { key: 'employee_id',       header: 'Employee ID',                type: 'text' },
  { key: 'department',        header: 'Department',                 type: 'text' },
  { key: 'location_flr',      header: 'Location / Floor',           type: 'text',   width: 160 },
  { key: 'manufacturer',      header: 'Manufacturer',               type: 'text' },
  { key: 'model',             header: 'Model',                      type: 'text' },
  { key: 'serial_number',     header: 'Serial Number',              type: 'text',   width: 130 },
  { key: 'asset_tag',         header: 'Asset Tag',                  type: 'text' },
  { key: 'cpu',               header: 'CPU',                        type: 'text' },
  { key: 'ram',               header: 'RAM (GB)',                   type: 'number' },
  { key: 'storage',           header: 'Storage (GB)',               type: 'number' },
  { key: 'encryption',        header: 'Encryption (BitLocker/FileVault)', type: 'text' },
  { key: 'mdm_enrolled',      header: 'MDM Enrolled',               type: 'boolean' },
  { key: 'edr_agent',         header: 'EDR Agent',                  type: 'boolean' },
  { key: 'antivirus',         header: 'Antivirus',                  type: 'boolean' },
  { key: 'last_login',        header: 'Last Login',                 type: 'date',   width: 140 },
  { key: 'purchase_date',     header: 'Purchase Date',              type: 'date',   width: 140 },
  { key: 'warranty_expiry',   header: 'Warranty Expiry',            type: 'date',   width: 140 },
  { key: 'eol_date',          header: 'EOL Date',                   type: 'date',   width: 140 },
  { key: 'notes',             header: 'Notes',                      type: 'text',   width: 200 },
]

const emptyEndpointsForm = (): EndpointsPayload => ({
  ci_name: '', 
  status: 'Active', 
  ci_type: null, 
  environment: 'Production',
  hostname: null,
  ip_address: null, 
  operating_system: null, 
  os_version: null, 
  patch_level: null,
  assigned_user: null,
  employee_id: null,
  department: null, 
  location_flr: null, 
  manufacturer: null, 
  model: null,
  serial_number: null, 
  asset_tag: null, 
  cpu: null,
  ram: null,
  storage: null,
  encryption: null,
  mdm_enrolled: true,
  edr_agent: true,
  antivirus: true,
  last_login: null,
  purchase_date: null, 
  warranty_expiry: null,
  eol_date: null, 
  notes: null,
})

export default function Endpoint() {
  return (
    <CITable<Endpoints, EndpointsPayload>
      idField="ci_id"
      columns={COLUMNS}
      service={endpointService}
      emptyForm={emptyEndpointsForm}
      statusOptions={STATUS_OPTIONS}
      addLabel="Add Endpoint"
      searchPlaceholder="Search by ID, name, IP..."
    />
  )
}