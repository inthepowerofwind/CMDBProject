// CI Table page for the Relationships module.
// Uses cellOverride to render custom dropdowns for CI category and CI ID fields.

import { useEffect, useRef, useState } from 'react'
import { Loader, Select } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import CITable from '../components/CITable/CITable'
import { EditableCell } from '../components/CITable/EditableCell'
import { CIColumnDef } from '../components/CITable/CITable.types'
import {
  relationshipService,
  Relationships,
  RelationshipsPayload,
  CiOption,
} from '../api/relationshipService'
import { CRIT_COLOR, badge } from '../utils/ciTableHelpers'

// Constants

// All CI category options shown in the Source / Target category dropdowns.
const CI_CATEGORIES = [
  'Server', 'Network', 'Endpoints',
  'Software', 'Cloud Services', 'Database',
]

// Relationship type options based on the Reference module.
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

// Column definitions
const COLUMNS: CIColumnDef<Relationships>[] = [
  { key: 'relationship_id',    header: 'Relationship ID *',    readOnly: true },
  { key: 'source_ci_category', header: 'Source CI Category *', type: 'text', width: 160, options: CI_CATEGORIES },
  { key: 'source_ci_id',       header: 'Source CI ID *',       type: 'text', width: 180 },
  { key: 'source_ci_name',     header: 'Source CI Name *',     type: 'text', width: 160, disabled: true },
  { key: 'relationship_type',  header: 'Relationship Type *',  type: 'text', width: 200, options: RELATIONSHIP_TYPES },
  { key: 'target_ci_category', header: 'Target CI Category *', type: 'text', width: 160, options: CI_CATEGORIES },
  { key: 'target_ci_id',       header: 'Target CI ID *',       type: 'text', width: 180 },
  { key: 'target_ci_name',     header: 'Target CI Name *',     type: 'text', width: 160, disabled: true },
  { key: 'description',        header: 'Description',        type: 'text', width: 200 },
  {
    key: 'criticality', header: 'Criticality', type: 'select', width: 120,
    options: ['Critical', 'High', 'Medium', 'Low'],
    render: badge(CRIT_COLOR),
  },
]

// Default add form

// Initial values shown when the user opens the inline add row
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

// CiIdSelect

interface CiIdSelectProps {
  value:      unknown
  category:   string
  // CI ID to exclude from the dropdown (the opposite side's selected value)
  excludeId?: string
  disabled?:  boolean
  width?:     number
  onSelect:   (ciId: string) => void
  onEnter?:   () => void
}

// Searchable dropdown that loads CI IDs for a given category
// Filters out excludeId so users cannot select the same CI on both sides
function CiIdSelect({
  value, category, excludeId, disabled, width, onSelect, onEnter,
}: CiIdSelectProps) {
  const [options, setOptions] = useState<CiOption[]>([])
  const [loading, setLoading] = useState(false)

  // Reload options whenever the category changes
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

  // Filter out the opposite side's selected CI ID to prevent duplicates
  const filteredOptions = options
    .filter((o) => o.ci_id !== excludeId)
    .map((o)    => ({ value: o.ci_id, label: o.ci_id }))

  return (
    <Select
      size="xs"
      searchable
      clearable
      disabled={disabled || loading}
      value={value ? String(value) : null}
      data={filteredOptions}
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

// Page component

export default function CIRelationships() {
  // Tracks the selected category for each row's source and target sides
  // Stored in a ref (not state) so it updates synchronously without
  // causing extra re-renders. Key format: ${rowId}:source / ${rowId}:target
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

        // Seed categoryRef from the row snapshot on first render
        // This ensures existing rows open in edit mode with the correct category
        const srcKey = `${rowId}:source`
        const tgtKey = `${rowId}:target`
        if (formSnapshot) {
          if (formSnapshot.source_ci_category && !categoryRef.current[srcKey])
            categoryRef.current[srcKey] = String(formSnapshot.source_ci_category)
          if (formSnapshot.target_ci_category && !categoryRef.current[tgtKey])
            categoryRef.current[tgtKey] = String(formSnapshot.target_ci_category)
        }

        // Category dropdowns
        if (col.key === 'source_ci_category' || col.key === 'target_ci_category') {
          const isSource = col.key === 'source_ci_category'
          const refKey   = isSource ? srcKey : tgtKey
          const idKey    = isSource ? 'source_ci_id'   : 'target_ci_id'
          const nameKey  = isSource ? 'source_ci_name' : 'target_ci_name'

          return (
            <EditableCell
              value={currentVal}
              field={col.key}
              type="text"
              options={CI_CATEGORIES}
              isEditing
              onChange={(f, v) => {
                // Update the ref immediately (before re-render) so the CI ID
                // dropdown below reads the new category on its next render
                categoryRef.current[refKey] = v as string
                setField(f,       v,  true)
                // Clear the dependent CI ID and name when category changes
                setField(idKey,   '', true)
                setField(nameKey, '', true)
              }}
              booleanFields={[]}
              width={col.width}
              onEnter={onEnter}
            />
          )
        }

        // CI ID dropdowns
        if (col.key !== 'source_ci_id' && col.key !== 'target_ci_id') return null

        const isSource  = col.key === 'source_ci_id'
        const refKey    = isSource ? srcKey : tgtKey
        const nameKey   = isSource ? 'source_ci_name' : 'target_ci_name'

        // Read the category from the ref (always current, never stale)
        const category  = categoryRef.current[refKey]
          ?? String(formSnapshot?.[isSource ? 'source_ci_category' : 'target_ci_category'] ?? '')

        // The opposite side's selected CI ID - excluded from this dropdown
        const excludeId = String(
          formSnapshot?.[isSource ? 'target_ci_id' : 'source_ci_id'] ?? ''
        ) || undefined

        return (
          <CiIdSelect
            // Remount when category or the excluded ID changes so the options
            // list reloads and the current value resets cleanly
            key={`${rowId}-${col.key}-${category}-${excludeId}`}
            value={currentVal}
            category={category}
            excludeId={excludeId}
            disabled={col.disabled}
            width={col.width}
            onSelect={async (ciId) => {
              // Duplicate guard - show an error and reject the selection if the
              // user somehow selects the same CI ID as the opposite side
              const oppositeId = String(
                formSnapshot?.[isSource ? 'target_ci_id' : 'source_ci_id'] ?? ''
              )
              if (ciId && ciId === oppositeId) {
                notifications.show({
                  color:   'red',
                  message: 'Source CI ID and Target CI ID cannot be the same.',
                })
                return
              }

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