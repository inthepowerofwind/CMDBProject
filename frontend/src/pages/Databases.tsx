import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { databasesService, Databases, DatabasesPayload } from '../api/databasesService'

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

const badge = (colorMap: Record<string, string>) => (value: unknown) =>
  value
    ? <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{value as string}</Badge>
    : null

const COLUMNS: CIColumnDef<Databases>[] = [
  { key: 'ci_id',             header: 'CI ID',                      readOnly: true },
  { key: 'database_name',     header: 'Database Name',              type: 'text',   width: 140 },
  { key: 'status',            header: 'Status',                     type: 'select', width: 180, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'db_type',           header: 'DB Type',                    type: 'text' },
  { key: 'version',           header: 'Version',                    type: 'text' },
  { key: 'environment',       header: 'Environment',                type: 'select', width: 160, options: ['Production','Staging','Testing / QA','Development','DR / Failover'] },
  { key: 'host_server',       header: 'Host Server / CI',           type: 'text',   width: 140 },
  { key: 'ip_address',        header: 'IP Address',                 type: 'text',   width: 150 },
  { key: 'port',              header: 'Port',                       type: 'number' },
  { key: 'criticality',       header: 'Criticality',                type: 'select', width: 120, options: ['Critical','High','Medium','Low'], render: badge(CRIT_COLOR) },
  { key: 'data_classification', header: 'Data Classification',      type: 'select', width: 20, options: ['Internal', 'External', 'Confidential'] },
  { key: 'size',              header: 'size',                       type: 'number' },
  { key: 'backup_enabled',    header: 'Backup Enabled',             type: 'boolean',width: 110 },
  { key: 'backup_frequency',  header: 'Backup Frequency',           type: 'text' },
  { key: 'last_backup',       header: 'Last Backup',                type: 'date',   width: 140 },
  { key: 'encryption_at_rest', header: 'Encryption at Rest',        type: 'boolean' },
  { key: 'tde_enabled',       header: 'TDE Enabled',                type: 'boolean' },
  { key: 'access_control',    header: 'Access Control (RBAC)',      type: 'boolean' },
  { key: 'monitoring_siem',   header: 'Monitoring (SIEM)',          type: 'boolean',width: 120 },
  { key: 'patch_level',       header: 'Patch Level',                type: 'text' },
  { key: 'eol_date',          header: 'EOL Date',                   type: 'date',   width: 140 },
  { key: 'db_owner',          header: 'DB Owner',                   type: 'text',   width: 140 },
  { key: 'business_application', header: 'Business Application',    type: 'text' },
  { key: 'last_review',       header: 'Last Review',                type: 'date',   width: 160 },
  { key: 'notes',             header: 'Notes',                      type: 'text',   width: 200 },
]

const emptyDatabaseForm = (): DatabasesPayload => ({
  database_name: '', 
  status: 'Active', 
  db_type: null, 
  version: null,
  environment: 'Production',
  host_server: null,
  ip_address: null, 
  port: null,
  criticality: 'Critical', 
  data_classification: 'Confidential', 
  size: null,
  backup_enabled: true,
  backup_frequency: true,
  last_backup: null,
  encryption_at_rest: true,
  tde_enabled: true,
  access_control: true,
  monitoring_siem: true, 
  patch_level: null, 
  eol_date: null, 
  db_owner: null,
  business_application: null,
  last_review: null, 
  notes: null,
})

export default function Database() {
  return (
    <CITable<Databases, DatabasesPayload>
      idField="ci_id"
      columns={COLUMNS}
      service={databasesService}
      emptyForm={emptyDatabaseForm}
      statusOptions={STATUS_OPTIONS}
      booleanFields={['backup_enabled', 'backup_frequency', 'encryption_at_rest', 
                      'tde_enabled', 'access_control', 'monitoring_siem']}
      addLabel="Add Database"
      searchPlaceholder="Search by ID, name, IP..."
    />
  )
}