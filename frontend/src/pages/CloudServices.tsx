
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { cloud_servicesService, CloudServices, CloudServicesPayload } from '../api/cloud_servicesService'
import {
  STATUS_COLOR,
  STATUS_OPTIONS,
  CRIT_COLOR,
  badge,
} from '../utils/ciTableHelpers'

// Cloud Services Table Column Headers, keys, and types
const COLUMNS: CIColumnDef<CloudServices>[] = [
  { key: 'ci_id',             header: 'CI ID',                      readOnly: true },
  { key: 'service_name',      header: 'Service Name',               type: 'text',   width: 140, placeholder: 'Required' },
  { key: 'status',            header: 'Status',                     type: 'select', width: 140, options: STATUS_OPTIONS, render: badge(STATUS_COLOR) },
  { key: 'service_type',      header: 'Service Type',               type: 'select', options: ['IaaS', 'PaaS', 'SaaS'] },
  { key: 'cloud_model',       header: 'Cloud Model',                type: 'select', width: 160, options: ['Public Cloud', 'Private Cloud'] },
  { key: 'provider',          header: 'Provider',                   type: 'text',   width: 150 },
  { key: 'region_data_recidency', header: 'Region / Data Residency',    type: 'text',   width: 150 },
  { key: 'service_tier',      header: 'Service Tier',               type: 'text',   width: 140 },
  { key: 'account_subscription_id', header: 'Account / Subscription ID',  type: 'text' },
  { key: 'criticality',       header: 'Criticality',                type: 'select', width: 120, options: ['Critical', 'High', 'Medium', 'Low'], render: badge(CRIT_COLOR) },
  { key: 'data_classification', header: 'Data Classification',      type: 'select', width: 20, options: ['Public', 'Internal', 'Confidential', 'Restricted'] },
  { key: 'monthly_cost',      header: 'Monthly Cost (USD)',         type: 'text' },
  { key: 'sla_uptime',        header: 'SLA Uptime Guarantee',       type: 'text' },
  { key: 'mfa_enforced',      header: 'MFA Enforced',               type: 'boolean' },
  { key: 'sso_integrated',    header: 'SSO Integrated',             type: 'boolean' },
  { key: 'encryption_at_rest', header: 'Encryption at Rest',        type: 'boolean' },
  { key: 'encryption_in_transit', header: 'Encryption in Transit',  type: 'boolean' },
  { key: 'dlp_monitored',     header: 'DLP Monitored',              type: 'boolean' },
  { key: 'logging_to_siem',   header: 'Logging to SIEM',            type: 'boolean' },
  { key: 'soc_2_certified',   header: 'SOC 2 Certified',            type: 'boolean' },
  { key: 'contract_expiry',   header: 'Contract Expiry',            type: 'date',   width: 140 },
  { key: 'shared_responsibility_documented', header: 'Shared Responsibility Documented', type: 'boolean' },
  { key: 'business_owner',    header: 'Business Owner',             type: 'text' },
  { key: 'it_owner',          header: 'IT Owner',                   type: 'text' },
  { key: 'last_security_review', header: 'Last Security Review',    type: 'date',   width: 140 },
  { key: 'notes',             header: 'Notes',                      type: 'text',   width: 200 },
]

// Cloud Services form - displays as default when adding a record
const emptyCloudServicesForm = (): CloudServicesPayload => ({
  service_name: '', 
  status: 'Active', 
  service_type: 'IaaS', 
  cloud_model: 'Public Cloud',
  provider: null,
  region_data_recidency: null, 
  service_tier: null, 
  account_subscription_id: null, 
  criticality: 'Critical',
  data_classification: 'Internal',
  monthly_cost: null,
  sla_uptime: null, 
  mfa_enforced: true,
  sso_integrated: true,
  encryption_at_rest: true,
  encryption_in_transit: true,
  dlp_monitored: true,
  logging_to_siem: true,
  soc_2_certified: true,
  contract_expiry: null,
  shared_responsibility_documented: true,
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
      emptyForm={emptyCloudServicesForm}
      statusOptions={STATUS_OPTIONS}
      booleanFields={['mfa_enforced', 'sso_integrated', 'encryption_at_rest', 'encryption_in_transit',
                      'dlp_monitored', 'logging_to_siem', 'soc_2_certified', 'shared_responsibility_documented'
                    ]}
      addLabel="Add Cloud Service"
      searchPlaceholder="Search by ID, name..."
      requiredFields={[ 'service_name' ]}
      requiredLabels={{ service_name: 'Service Name' }}
    />
  )
}