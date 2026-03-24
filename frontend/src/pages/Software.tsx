import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { softwareService, Software, SoftwarePayload } from '../api/softwareService'

const STATUS_COLOR: Record<string, string> = {
  Active: 'green', 
  Decommissioned: 'gray', 
  EOL: 'red',
  'In Procurement': 'orange', 
  'In Deployment': 'blue', 
  Maintenance: 'yellow',
}

const CRIT_COLOR: Record<string, string> = {
  Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'blue',
}

const STATUS_OPTIONS = ['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']

const badge = (colorMap: Record<string, string>) => (value: unknown) =>
  value
    ? <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{value as string}</Badge>
    : null

const COLUMNS: CIColumnDef<Software>[] = [
  { key: 'ci_id',             header: 'CI ID',                      readOnly: true },
  { key: 'ci_name',           header: 'CI Name',                    type: 'text',   width: 140 },
  { key: 'status',            header: 'Status',                     type: 'select', width: 180, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'software_type',     header: 'Software Type',              type: 'text' },
  { key: 'version',           header: 'Version',                    type: 'text' },
  { key: 'vendor',            header: 'Vendor',                     type: 'text' },
  { key: 'license_type',      header: 'License Type',               type: 'text' },
  { key: 'license_count',     header: 'License Count (Purchased)',  type: 'text' },
  { key: 'license_deployed',  header: 'License Deployed',           type: 'text' },
  { key: 'license_available', header: 'License Available',          type: 'text' },
  { key: 'compliance_status', header: 'Compliance Status',          type: 'select', width: 180, options: ['Compliant', 'At Limit'] },
  { key: 'installed_on',      header: 'Installed On (Systems)',     type: 'text' },
  { key: 'environment',       header: 'Environment',                type: 'select', width: 160, options: ['Production', 'Staging', 'Testing / QA', 'Development', 'DR / Failover'] },
  { key: 'criticality',       header: 'Criticality',                type: 'select', width: 120, options: ['Critical', 'High', 'Medium', 'Low'], render: badge(CRIT_COLOR) },
  { key: 'data_classification', header: 'Data Classification',      type: 'select', width: 120, options: ['Internal', 'External', 'Confidential'] },
  { key: 'auto_update',       header: 'Auto Update',                type: 'boolean', width: 110 },
  { key: 'asl_approved',      header: 'ASL Approved',               type: 'boolean', width: 110 },
  { key: 'sast_dast_tested',  header: 'SAST/DAST Tested',           type: 'select', width: 120, options: ['Yes', 'No', 'N/A'] },
  { key: 'license_key_loc',   header: 'License Key Location',       type: 'text' },
  { key: 'procurement_date',  header: 'Procurement Date',           type: 'date',   width: 140 },
  { key: 'license_expiry',    header: 'License Expiry',             type: 'text',   width: 140 },
  { key: 'eol_date',          header: 'EOL Date',                   type: 'text',   width: 140 },
  { key: 'last_review',       header: 'Last Review',                type: 'date',   width: 140 },
  { key: 'notes',             header: 'Notes',                      type: 'text',   width: 200 },
]

const emptySoftwareForm = (): SoftwarePayload => ({
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

export default function Softwares() {
  return (
    <CITable<Software, SoftwarePayload>
      idField="ci_id"
      columns={COLUMNS}
      service={softwareService}
      emptyForm={emptySoftwareForm}
      statusOptions={STATUS_OPTIONS}
      addLabel="Add Software"
      searchPlaceholder="Search by ID, name..."
    />
  )
}