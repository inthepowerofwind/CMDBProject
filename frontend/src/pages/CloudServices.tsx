import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { cloud_servicesService, CloudServices, CloudServicesPayload } from '../api/cloud_servicesService'

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

const COLUMNS: CIColumnDef<CloudServices>[] = [
  { key: 'ci_id',             header: 'CI ID',                      readOnly: true },
  { key: 'service_name',      header: 'Service Name',               type: 'text',   width: 140 },
  { key: 'status',            header: 'Status',                     type: 'select', width: 180, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'service_type',      header: 'Service Type',               type: 'text' },
  { key: 'cloud_model',       header: 'Cloud Model',                type: 'select', width: 160, options: ['Public Cloud', 'Private Cloud'] },
  { key: 'provider',          header: 'Provider',                   type: 'text',   width: 150 },
  { key: 'region',            header: 'Region / Data Residency',    type: 'text',   width: 150 },
  { key: 'service_tier',      header: 'Service Tier',               type: 'text',   width: 140 },
  { key: 'account_id',        header: 'Account / Subscription ID',  type: 'text' },
  { key: 'criticality',       header: 'Criticality',                type: 'select', width: 120, options: ['Critical', 'High', 'Medium', 'Low'], render: badge(CRIT_COLOR) },
  { key: 'data_classification', header: 'Data Classification',      type: 'select', width: 20, options: ['Internal', 'External', 'Confidential'] },
  { key: 'monthly_cost',      header: 'Monthly Cost (USD)',         type: 'text' },
  { key: 'sla_uptime',        header: 'SLA Uptime Guarantee',       type: 'text' },
  { key: 'mfa_enfored',       header: 'MFA Enforced',               type: 'boolean' },
  { key: 'sso_integrated',    header: 'SSO Integrated',             type: 'boolean' },
  { key: 'encryption_at_rest', header: 'Encryption at Rest',        type: 'boolean' },
  { key: 'encryption_in_transit', header: 'Encryption in Transit',  type: 'boolean' },
  { key: 'dlp_monitored',     header: 'DLP Monitored',              type: 'boolean' },
  { key: 'logging_to_siem',   header: 'Logging to SIEM',            type: 'boolean' },
  { key: 'soc2_certified',    header: 'SOC 2 Certified',            type: 'boolean' },
  { key: 'contract_expiry',   header: 'Contract Expiry',            type: 'date',   width: 140 },
  { key: 'shared_responsibility', header: 'Shared Responsibility Documented', type: 'boolean' },
  { key: 'business_owner',    header: 'Business Owner',             type: 'text' },
  { key: 'it_owner',          header: 'IT Owner',                   type: 'text' },
  { key: 'last_security_review', header: 'Last Security Review',    type: 'date',   width: 140 },
  { key: 'notes',             header: 'Notes',                      type: 'text',   width: 200 },
]

const emptyEndpointsForm = (): CloudServicesPayload => ({
  service_name: '', 
  status: 'Active', 
  service_type: null, 
  cloud_model: 'Public Cloud',
  provider: null,
  region: null, 
  service_tier: null, 
  account_id: null, 
  criticality: 'Critical',
  data_classification: 'Internal',
  monthly_cost: null,
  sla_uptime: null, 
  mfa_enfored: true,
  sso_integrated: true,
  encryption_at_rest: true,
  encryption_in_transit: true,
  dlp_monitored: true,
  logging_to_siem: true,
  soc2_certified: true,
  contract_expiry: null,
  shared_responsibility: true,
  business_owner: null,
  it_owner: null,
  last_security_review: null,
  notes: null,
})

export default function cloud_services() {
  return (
    <CITable<CloudServices, CloudServicesPayload>
      idField="ci_id"
      columns={COLUMNS}
      service={cloud_servicesService}
      emptyForm={emptyEndpointsForm}
      statusOptions={STATUS_OPTIONS}
      addLabel="Add Cloud Service"
      searchPlaceholder="Search by ID, name..."
    />
  )
}