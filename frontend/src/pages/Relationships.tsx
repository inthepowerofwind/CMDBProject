import { Badge } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { CIColumnDef } from '../components/CITable/CITable.types'
import { relationshipService, Relationships, RelationshipsPayload } from '../api/relationshipService'

const CRIT_COLOR: Record<string, string> = {
  Critical: 'red', 
  High: 'orange', 
  Medium: 'yellow', 
  Low: 'blue',
}

const badge = (colorMap: Record<string, string>) => (value: unknown) =>
  value
    ? <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{value as string}</Badge>
    : null

const COLUMNS: CIColumnDef<Relationships>[] = [
  { key: 'relationship_id',   header: 'Relationship ID',            readOnly: true },
  { key: 'source_ci_id',      header: 'Source CI ID',               type: 'text',   width: 140 },
  { key: 'source_ci_name',    header: 'Source CI Name',             type: 'text',   width: 140 },
  { key: 'source_ci_table',   header: 'Source CI Table',            type: 'text',   width: 140 },
  { key: 'target_ci_table',   header: 'Target CI Table',            type: 'text',   width: 140 },
  { key: 'relationship_type', header: 'Relationship Type',          type: 'text',   width: 140 },
  { key: 'target_ci_id',      header: 'Target CI ID',               type: 'text',   width: 140 },
  { key: 'target_ci_name',    header: 'Target CI Name',             type: 'text',   width: 140 },
  { key: 'description',       header: 'Description',                type: 'text',   width: 200 },
  { key: 'criticality',       header: 'Criticality',                type: 'select', width: 120, options: ['Critical','High','Medium','Low'], render: badge(CRIT_COLOR) },
]

const emptyRelationshipForm = (): RelationshipsPayload => ({
  source_ci_id: '', 
  source_ci_name: '',
  relationship_type: '',
  target_ci_id: '',
  target_ci_name: '',
  source_ci_table: '',
  target_ci_table: '',
  description: '', 
  criticality: 'Critical',
})

export default function CIRelationships() {
  return (
    <CITable<Relationships, RelationshipsPayload>
      idField="relationship_id"
      columns={COLUMNS}
      service={relationshipService}
      emptyForm={emptyRelationshipForm}
      addLabel="Add Relationship"
      searchPlaceholder="Search by ID, name, relationship..."
      requiredFields={[
        'source_ci_id',
        'source_ci_name',
        'source_ci_table',
        'relationship_type',
        'target_ci_id',
        'target_ci_name',
        'target_ci_table',
      ]}
    />
  )
}