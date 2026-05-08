import { useEffect, useRef, useState } from 'react'
import { Badge, Loader, Select } from '@mantine/core'
import CITable from '../components/CITable/CITable'
import { EditableCell } from '../components/CITable/EditableCell'
import { CIColumnDef } from '../components/CITable/CITable.types'
import {
  relationshipService,
  Relationships,
  RelationshipsPayload,
  CiOption,
} from '../api/relationshipService'

// list of all the CI Categories for the dropdown options
const CI_CATEGORIES = ['Server', 'Network', 'Endpoints', 'Software', 'Cloud Services', 'Database']

// Relationship types based on the Reference
const RELATIONSHIP_TYPES = [
  'Runs On / Hosted By',
  'Uses / Depends On',
  'Hosts / Virtualizes',
  'Backed Up By',
  'Replicates To',
  'HA Pair',
  'Protects / Fronts',
  'Load Balances',
  'Contains PII For',
]

// Criticality color based on the Reference
const CRIT_COLOR: Record<string, string> = {
  Critical: 'red',
  High:     'orange',
  Medium:   'yellow',
  Low:      'blue',
}

// Status color badge 
const badge = (colorMap: Record<string, string>) => (value: unknown) =>
  value ? (
    <Badge color={colorMap[value as string] ?? 'gray'} variant="light" size="sm"
      style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>
      {value as string}
    </Badge>
  ) : null

interface CiIdSelectProps {
  value:     unknown
  category:  string
  disabled?: boolean
  width?:    number
  onSelect:  (ciId: string) => void
  onEnter?:  () => void
}

function CiIdSelect({ value, category, disabled, width, onSelect, onEnter }: CiIdSelectProps) {
  const [options, setOptions] = useState<CiOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!category) { setOptions([]); return }
    let cancelled = false
    setLoading(true)
    relationshipService
      .listCis(category)
      .then((list) => { if (!cancelled) setOptions(list) })
      .catch(()    => { if (!cancelled) setOptions([]) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [category])

  return (
    <Select
      size="xs" searchable clearable
      disabled={disabled || loading}
      value={value ? String(value) : null}
      data={options.map((o) => ({ value: o.ci_id, label: o.ci_id }))}
      placeholder={loading ? 'Loading…' : 'Select CI ID'}
      rightSection={loading ? <Loader size={10} /> : undefined}
      onChange={(v) => onSelect(v ?? '')}
      onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
      nothingFoundMessage="No CIs found"
      style={{ minWidth: width ?? 180 }}
      comboboxProps={{ withinPortal: true }}
    />
  )
}

// Relationships Table Column Headers, keys, and types
const COLUMNS: CIColumnDef<Relationships>[] = [
  { key: 'relationship_id',    header: 'Relationship ID',    readOnly: true },
  { key: 'source_ci_category', header: 'Source CI Category', type: 'text', width: 160, options: CI_CATEGORIES },
  { key: 'source_ci_id',       header: 'Source CI ID',       type: 'text', width: 180 },
  { key: 'source_ci_name',     header: 'Source CI Name',     type: 'text', width: 160, disabled: true },
  { key: 'relationship_type',  header: 'Relationship Type',  type: 'text', width: 200, options: RELATIONSHIP_TYPES },
  { key: 'target_ci_category', header: 'Target CI Category', type: 'text', width: 160, options: CI_CATEGORIES },
  { key: 'target_ci_id',       header: 'Target CI ID',       type: 'text', width: 180 },
  { key: 'target_ci_name',     header: 'Target CI Name',     type: 'text', width: 160, disabled: true },
  { key: 'description',        header: 'Description',        type: 'text', width: 200 },
  {
    key: 'criticality',        header: 'Criticality',        type: 'select', width: 120, options: ['Critical', 'High', 'Medium', 'Low'], render: badge(CRIT_COLOR), },
]

// Relationships form - displays as default when adding a record
const emptyRelationshipForm = (): RelationshipsPayload => ({
  source_ci_id:       '',
  source_ci_category: 'Server',
  source_ci_name:     '',
  relationship_type:  'Runs On / Hosted By',
  target_ci_category: 'Server',
  target_ci_id:       '',
  target_ci_name:     '',
  description:        '',
  criticality:        'Critical',
})

export default function CIRelationships() {
  // Per-row category tracking - updated immediately on change, read on render
  // key: `${rowId}:source` or `${rowId}:target`
  const categoryRef = useRef<Record<string, string>>({})

  return (
    <CITable<Relationships, RelationshipsPayload>
      idField="relationship_id"
      columns={COLUMNS}
      service={relationshipService}
      emptyForm={emptyRelationshipForm}
      tableMinWidth={1200}
      addLabel="Add Relationship"
      searchPlaceholder="Search by ID, name, relationship..."
      requiredFields={['source_ci_id', 'source_ci_name', 'relationship_type', 'target_ci_id', 'target_ci_name']}
      cellOverride={(col, rowId, currentVal, formSnapshot, setField, onEnter) => {

        // Seed categoryRef from snapshot on first render of each row
        const srcKey = `${rowId}:source`
        const tgtKey = `${rowId}:target`
        if (formSnapshot) {
          if (formSnapshot.source_ci_category && !categoryRef.current[srcKey])
            categoryRef.current[srcKey] = String(formSnapshot.source_ci_category)
          if (formSnapshot.target_ci_category && !categoryRef.current[tgtKey])
            categoryRef.current[tgtKey] = String(formSnapshot.target_ci_category)
        }

        // Category columns
        if (col.key === 'source_ci_category' || col.key === 'target_ci_category') {
          const isSource = col.key === 'source_ci_category'
          const refKey   = isSource ? srcKey   : tgtKey
          const idKey    = isSource ? 'source_ci_id'   : 'target_ci_id'
          const nameKey  = isSource ? 'source_ci_name' : 'target_ci_name'

          return (
            <EditableCell
              value={currentVal}
              field={col.key}
              type="text"
              options={CI_CATEGORIES}
              isEditing
              onChange={(f, v, _r) => {
                // Update ref immediately - before re-render
                categoryRef.current[refKey] = v as string
                setField(f,       v,  true)
                setField(idKey,   '', true)
                setField(nameKey, '', true)
              }}
              booleanFields={[]}
              width={col.width}
              onEnter={onEnter}
            />
          )
        }

        // CI ID columns
        if (col.key !== 'source_ci_id' && col.key !== 'target_ci_id') return null

        const isSource = col.key === 'source_ci_id'
        const refKey   = isSource ? srcKey   : tgtKey
        const nameKey  = isSource ? 'source_ci_name' : 'target_ci_name'

        // Always read from ref - never stale
        const category = categoryRef.current[refKey]
          ?? String(formSnapshot?.[isSource ? 'source_ci_category' : 'target_ci_category'] ?? '')

        return (
          <CiIdSelect
            key={`${rowId}-${col.key}-${category}`}   // remount when category changes
            value={currentVal}
            category={category}
            disabled={col.disabled}
            width={col.width}
            onSelect={async (ciId) => {
              setField(col.key, ciId, true)
              setField(nameKey, '',   true)
              if (ciId) {
                const result = await relationshipService.lookupCi(ciId)
                if (result) setField(nameKey, result.ci_name, true)
              }
            }}
            onEnter={onEnter}
          />
        )
      }}
    />
  )
}