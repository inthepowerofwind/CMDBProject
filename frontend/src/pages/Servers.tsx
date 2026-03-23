import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import { serverService, Server, ServerPayload } from '../api/serverService'
import {

  Box, Text, Badge, ScrollArea, Button, Loader,
  TextInput, Select, Group, Alert, Tooltip, Checkbox, Pagination,
} from '@mantine/core'
import {
  IconPlus, IconChevronUp, IconChevronDown, IconSelector,
  IconTrash, IconEdit, IconDeviceFloppy, IconAlertCircle, IconX,

} from '@tabler/icons-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'

const PER_PAGE = 15

const statusColor: Record<NonNullable<Server['status']>, string> = {
  Active:           'green',
  Decommissioned:   'gray',
  EOL:              'red',
  'In Procurement': 'orange',
  'In Deployment':  'blue',
  Maintenance:      'yellow',
}

const criticalityColor: Record<NonNullable<Server['criticality']>, string> = {
  Critical: 'red',
  High:     'orange',
  Medium:   'yellow',
  Low:      'blue',
  Critical:         'red',
  High:             'orange',
  Medium:           'yellow',
  Low:              'blue',
}

const emptyForm = (): ServerPayload => ({
  ci_name: '', status: 'Active', ci_type: null,
  environment: 'Production', hostname: null,
  operating_system: null, os_version: null,
  patch_level: null, cpu_cores: null,
  ram_gb: null, storage_tb: null,
  virtualized: false, location: null, rack_slot: null,
  criticality: 'Medium', business_service: null,
  assigned_owner: null, department: null,
  manufacturer: null, model: null,
  serial_number: null, asset_tag: null,
  purchase_date: null, warranty_expiry: null,
  eol_date: null, last_config_review: null,
  baseline_applied: false, backup_enabled: false,
  monitoring_siem: false, notes: null,
  ci_name:          '',           status:             'Active',   ci_type:          null,
  environment:      'Production', hostname:           null,       operating_system: null, 
  os_version:       null,         patch_level:        null,       cpu_cores:        null,
  ram_gb:           null,         storage_tb:         null,       virtualized:      false,  
  location:         null,         rack_slot:          null,       criticality:      'Medium', 
  business_service: null,         assigned_owner:     null,       department:       null,
  manufacturer:     null,         model:              null,       serial_number:    null, 
  asset_tag:        null,         purchase_date:      null,       warranty_expiry:  null,
  eol_date:         null,         last_config_review: null,       baseline_applied: false, 
  backup_enabled:   false,        monitoring_siem:    false,      notes:            null,
})

const columnHelper = createColumnHelper<Server>()

// Inline cell editor
function EditableCell({
  value,
  field,
  type = 'text',
  options,
  isEditing,
  onChange,
  minWidth,
}: {
  value: unknown
  field: string
  type?: string
  options?: string[]
  isEditing: boolean
  onChange: (field: string, value: unknown, rerender?: boolean) => void
  minWidth?: number
}) {
<<<<<<< HEAD
  const toStr = (v: unknown) => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    const s = String(v ?? '')
    return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.split('T')[0] : s

=======
  const toStr = (v: unknown): string => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    const s = String(v ?? '')
    return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.split('T')[0] : s
>>>>>>> f9dc3515ae0aede561427f765855732080cd1a24
  }

  const [localValue, setLocalValue] = useState<string>(toStr(value))
  const [selectValue, setSelectValue] = useState<string>(toStr(value))

  const wasEditing = useRef(false)
  useEffect(() => {
    if (isEditing && !wasEditing.current) {
      setLocalValue(toStr(value))
      setSelectValue(toStr(value))
    }
    wasEditing.current = isEditing
  }, [isEditing])

  if (!isEditing) {
    if (typeof value === 'boolean') return <Text size="sm">{value ? 'Yes' : 'No'}</Text>
    const display = toStr(value)
    return <Text size="sm">{display || '—'}</Text>
  }

  if (options) {
    return (
      <Select
        size="xs"
        value={selectValue}
        onChange={(v) => {
          const next = v ?? ''
          setSelectValue(next)
          if (['virtualized','baseline_applied','backup_enabled','monitoring_siem'].includes(field)) {
            onChange(field, next === 'Yes', true)
          } else {
            onChange(field, next || null, true)
          }
        }}
        data={options}
        style={{ minWidth: minWidth ?? 120 }}
      />
    )
  }

  return (
    <TextInput
      size="xs"
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => onChange(field, e.target.value || null, false)}
      style={{ minWidth: minWidth ?? 100 }}
      autoComplete="off"
    />
  )
}

export default function Servers() {
  const [servers, setServers]       = useState<Server[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const [sorting, setSorting]       = useState<SortingState>([])

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCheckboxes, setShowCheckboxes] = useState(false)

  // Inline add row
  const [isAdding, setIsAdding]     = useState(false)
  const [newForm, setNewForm]       = useState<ServerPayload>(emptyForm())
  const [saving, setSaving]         = useState(false)

  // Grid edit state
  const [isGridEditing, setIsGridEditing] = useState(false)
  const [editForms, setEditForms]   = useState<Record<string, Partial<ServerPayload>>>({})
  const editFormsRef = useRef<Record<string, Partial<ServerPayload>>>({})
  const [editSaving, setEditSaving] = useState(false)

  const sortBy  = sorting[0]?.id
  const sortDir = (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc'
  const sortBy         = sorting[0]?.id
  const sortDir        = (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc'

  const fetchServers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page, per_page: PER_PAGE,
        search:   search || undefined,
        status:   filterStatus || undefined,
        sort_by:  sortBy,
        sort_dir: sortDir,
      }
      const result = await serverService.list(params)
      setServers(result.data)
      setTotal(result.total)
      setLastPage(result.last_page)
    } catch {
      setError('Failed to load servers.')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, sortBy, sortDir])

  useEffect(() => { fetchServers() }, [fetchServers])

  // Reset selection when page/filter changes
  useEffect(() => {
    setSelectedIds(new Set())
    setShowCheckboxes(false)
  }, [page, search, filterStatus])

  const setNewField = (key: keyof ServerPayload, value: unknown) =>
    setNewForm((f) => ({ ...f, [key]: value } as ServerPayload))

  const setGridField = (ciId: string, key: string, value: unknown, rerender = false) => {
    editFormsRef.current = {
      ...editFormsRef.current,
      [ciId]: { ...editFormsRef.current[ciId], [key]: value },
    }
    if (rerender) {
      // Sync ref into state so React re-renders and shows the new Select value
      setEditForms({ ...editFormsRef.current })
    }
  }

  // Add 
  const handleAdd = async () => {
    setSaving(true)
    try {
      const created = await serverService.create(newForm)
      setServers((prev) => [...prev, created])
      setTotal((t) => t + 1)
      setNewForm(emptyForm())
      setIsAdding(false)
      notifications.show({ color: 'green', message: `${created.ci_id} added.` })
      await fetchServers()
    } catch {
      notifications.show({ color: 'red', message: 'Failed to add server.' })
    } finally {
      setSaving(false)
    }
  }

  // Grid Edit
  const handleStartGridEdit = () => {
    const initial: Record<string, Partial<ServerPayload>> = {}
    servers.forEach((s) => { initial[s.ci_id] = { ...s } })
    editFormsRef.current = initial
    setEditForms(initial)
    setIsGridEditing(true)
  }

  const handleSaveGridEdit = async () => {
    setEditSaving(true)
    try {
      const currentForms = editFormsRef.current
      const updates = servers.filter((s) => currentForms[s.ci_id])
      const results = await Promise.all(
        updates.map((s) => serverService.update(s.ci_id, currentForms[s.ci_id] as ServerPayload))
      )
      // Replace updated rows in state
      setServers((prev) =>
        prev.map((s) => {
          const updated = results.find((r) => r.ci_id === s.ci_id)
          return updated ?? s
        })
      )
      setIsGridEditing(false)
      setEditForms({})
      notifications.show({ color: 'green', message: 'Changes saved.' })
      await fetchServers()
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save changes.' })
    } finally {
      setEditSaving(false)
    }
  }

  const handleCancelGridEdit = () => {
    setIsGridEditing(false)
    setEditForms({})
    editFormsRef.current = {}
  }

  // Delete
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => serverService.delete(id)))
      setServers((prev) => prev.filter((s) => !selectedIds.has(s.ci_id)))
      setTotal((t) => t - ids.length)
      setSelectedIds(new Set())
      setShowCheckboxes(false)
      notifications.show({ color: 'orange', message: `${ids.length} server(s) deleted.` })
      await fetchServers()
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete.' })
    }
  }

  // Row selection
  const handleRowClick = (ciId: string) => {
    if (isGridEditing) return
    setShowCheckboxes(true)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(ciId)) {
        next.delete(ciId)
        if (next.size === 0) setShowCheckboxes(false)
      } else {
        next.add(ciId)
      }
      return next
    })
  }

  const allSelected  = servers.length > 0 && servers.every((s) => selectedIds.has(s.ci_id))
  const someSelected = selectedIds.size > 0 && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      setShowCheckboxes(false)
    } else {
      setSelectedIds(new Set(servers.map((s) => s.ci_id)))
    }
  }

  const columns = useMemo(() => [
    // Checkbox column
    columnHelper.display({
      id: 'select',
      header: () => showCheckboxes && !isGridEditing ? (
        <Tooltip label={allSelected ? 'Deselect All' : 'Select All'} withArrow>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAll}
            size="xs"
          />
        </Tooltip>
      ) : null,
      cell: ({ row }) => showCheckboxes && !isGridEditing ? (
        <Checkbox
          checked={selectedIds.has(row.original.ci_id)}
          onChange={() => handleRowClick(row.original.ci_id)}
          size="xs"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null,
    }),

    columnHelper.accessor('ci_id', {
      header: 'CI ID',
      cell: (i) => <Text size="sm" c="dimmed">{i.getValue()}</Text>,
    }),

    columnHelper.accessor('ci_name', {
      header: 'CI Name',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.ci_name ?? row.original.ci_name) : row.original.ci_name
        return <EditableCell value={val} field="ci_name" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.status ?? row.original.status) : row.original.status
        return editing
          ? <EditableCell value={val} field="status" options={['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']} isEditing onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={180} />
          : <Badge color={statusColor[row.original.status]} variant="light" size="sm" style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{row.original.status}</Badge>
      },
    }),

    columnHelper.accessor('ci_type', {
      header: 'CI Type',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.ci_type ?? row.original.ci_type) : row.original.ci_type
        return <EditableCell value={val} field="ci_type" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('environment', {
      header: 'Environment',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.environment ?? row.original.environment) : row.original.environment
        return <EditableCell value={val} field="environment" options={['Production','Staging','Testing / QA','Development','DR / Failover']} isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={160} />
      },
    }),

    columnHelper.accessor('hostname', {
      header: 'Hostname / IP Address',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.hostname ?? row.original.hostname) : row.original.hostname
        return <EditableCell value={val} field="hostname" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={140} />
      },
    }),

    columnHelper.accessor('operating_system', {
      header: 'Operating System',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.operating_system ?? row.original.operating_system) : row.original.operating_system
        return <EditableCell value={val} field="operating_system" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('os_version', {
      header: 'OS Version',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.os_version ?? row.original.os_version) : row.original.os_version
        return <EditableCell value={val} field="os_version" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('patch_level', {
      header: 'Patch Level',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.patch_level ?? row.original.patch_level) : row.original.patch_level
        return <EditableCell value={val} field="patch_level" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('cpu_cores', {
      header: 'CPU Cores',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.cpu_cores ?? row.original.cpu_cores) : row.original.cpu_cores
        return <EditableCell value={val} field="cpu_cores" type="number" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={80} />
      },
    }),

    columnHelper.accessor('ram_gb', {
      header: 'RAM (GB)',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.ram_gb ?? row.original.ram_gb) : row.original.ram_gb
        return <EditableCell value={val} field="ram_gb" type="number" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={80} />
      },
    }),

    columnHelper.accessor('storage_tb', {
      header: 'Storage (TB)',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.storage_tb ?? row.original.storage_tb) : row.original.storage_tb
        return <EditableCell value={val} field="storage_tb" type="number" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={90} />
      },
    }),

    columnHelper.accessor('virtualized', {
      header: 'Virtualized',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.virtualized ?? row.original.virtualized) : row.original.virtualized
        return <EditableCell value={val} field="virtualized" options={['Yes','No']} isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={90} />
      },
    }),

    columnHelper.accessor('location', {
      header: 'Location / Data Center',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.location ?? row.original.location) : row.original.location
        return <EditableCell value={val} field="location" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={150} />
      },
    }),

    columnHelper.accessor('rack_slot', {
      header: 'Rack / Slot',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.rack_slot ?? row.original.rack_slot) : row.original.rack_slot
        return <EditableCell value={val} field="rack_slot" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('criticality', {
      header: 'Criticality',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.criticality ?? row.original.criticality) : row.original.criticality
        return editing
          ? <EditableCell value={val} field="criticality" options={['Critical','High','Medium','Low']} isEditing onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={120} />
          : val
            ? <Badge color={criticalityColor[val!] ?? 'gray'} variant="light" size="sm" style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>{val}</Badge>
            : <Text size="sm">—</Text>
      },
    }),

    columnHelper.accessor('business_service', {
      header: 'Business Service',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.business_service ?? row.original.business_service) : row.original.business_service
        return <EditableCell value={val} field="business_service" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('assigned_owner', {
      header: 'Assigned Owner',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.assigned_owner ?? row.original.assigned_owner) : row.original.assigned_owner
        return <EditableCell value={val} field="assigned_owner" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('department', {
      header: 'Department',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.department ?? row.original.department) : row.original.department
        return <EditableCell value={val} field="department" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('manufacturer', {
      header: 'Manufacturer',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.manufacturer ?? row.original.manufacturer) : row.original.manufacturer
        return <EditableCell value={val} field="manufacturer" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('model', {
      header: 'Model',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.model ?? row.original.model) : row.original.model
        return <EditableCell value={val} field="model" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('serial_number', {
      header: 'Serial Number',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.serial_number ?? row.original.serial_number) : row.original.serial_number
        return <EditableCell value={val} field="serial_number" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('asset_tag', {
      header: 'Asset Tag',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.asset_tag ?? row.original.asset_tag) : row.original.asset_tag
        return <EditableCell value={val} field="asset_tag" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} />
      },
    }),

    columnHelper.accessor('purchase_date', {
      header: 'Purchase Date',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing
          ? (editFormsRef.current[row.original.ci_id]?.['purchase_date'] ?? row.original.purchase_date)
          : row.original.purchase_date
        return (
          <EditableCell
            value={val}
            field="purchase_date"
            type="date"
            isEditing={editing}
            onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)}
            minWidth={140}
          />
        )
      },
    }),
    
    columnHelper.accessor('warranty_expiry', {
      header: 'Warranty Expiry',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing
          ? (editFormsRef.current[row.original.ci_id]?.['warranty_expiry'] ?? row.original.warranty_expiry)
          : row.original.warranty_expiry
        return (
          <EditableCell
            value={val}
            field="warranty_expiry"
            type="date"
            isEditing={editing}
            onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)}
            minWidth={140}
          />
        )
      },
    }),
    
    columnHelper.accessor('eol_date', {
      header: 'EOL Date',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing
          ? (editFormsRef.current[row.original.ci_id]?.['eol_date'] ?? row.original.eol_date)
          : row.original.eol_date
        return (
          <EditableCell
            value={val}
            field="eol_date"
            type="date"
            isEditing={editing}
            onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)}
            minWidth={140}
          />
        )
      },
    }),
    
    columnHelper.accessor('last_config_review', {
      header: 'Last Configuration Review',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing
          ? (editFormsRef.current[row.original.ci_id]?.['last_config_review'] ?? row.original.last_config_review)
          : row.original.last_config_review
        return (
          <EditableCell
            value={val}
            field="last_config_review"
            type="date"
            isEditing={editing}
            onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)}
            minWidth={140}
          />
        )
      },
    }),
    
    columnHelper.accessor('baseline_applied', {
      header: 'Baseline Applied',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.baseline_applied ?? row.original.baseline_applied) : row.original.baseline_applied
        return <EditableCell value={val} field="baseline_applied" options={['Yes','No']} isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={90} />
      },
    }),

    columnHelper.accessor('backup_enabled', {
      header: 'Backup Enabled',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.backup_enabled ?? row.original.backup_enabled) : row.original.backup_enabled
        return <EditableCell value={val} field="backup_enabled" options={['Yes','No']} isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={90} />
      },
    }),

    columnHelper.accessor('monitoring_siem', {
      header: 'Monitoring (SIEM)',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.monitoring_siem ?? row.original.monitoring_siem) : row.original.monitoring_siem
        return <EditableCell value={val} field="monitoring_siem" options={['Yes','No']} isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={90} />
      },
    }),

    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: ({ row }) => {
        const editing = isGridEditing
        const val = editing ? (editFormsRef.current[row.original.ci_id]?.notes ?? row.original.notes) : row.original.notes
        return <EditableCell value={val} field="notes" isEditing={editing} onChange={(f, v, r) => setGridField(row.original.ci_id, f, v, r)} minWidth={180} />
      },
    }),

  ], [servers, selectedIds, showCheckboxes, isGridEditing, allSelected, someSelected])

  const table = useReactTable({
    data: servers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const hasSelection = selectedIds.size > 0

  return (
    <Box p="xl">
      {/* Toolbar */}
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          <TextInput
            placeholder="Search by ID, name, OS..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            size="sm"
            style={{ width: 240 }}
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPage(1) }}
            data={['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']}
            clearable size="sm" style={{ width: 200 }}
          />
          <Text size="sm" c="dimmed">Total: {total}</Text>
        </Group>

        <Group gap={8}>
          {/* Grid Edit mode */}
          {isGridEditing ? (
            <>
              <Button
                size="sm"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={14} />}
                onClick={handleCancelGridEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                leftSection={<IconDeviceFloppy size={14} />}
                onClick={handleSaveGridEdit}
                loading={editSaving}
                style={{ backgroundColor: '#2563EB' }}
              >
                Save Changes
              </Button>
            </>
            
          ) : isAdding ? (
            
            /* Add row mode */
            <>
              <Button
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => { setIsAdding(false); setNewForm(emptyForm()) }}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                leftSection={<IconDeviceFloppy size={14} />}
                onClick={handleAdd}
                loading={saving}
                disabled={!newForm.ci_name}
                style={{ backgroundColor: '#2563EB' }}
              >
                Save Server
              </Button>
            </>
          ) : (
            <>
              {/* Cancel button */}
              {hasSelection && (
                <Button
                  size="sm"
                  variant="subtle"
                  color="gray"
                  leftSection={<IconX size={14} />}
                  onClick={() => {
                    setSelectedIds(new Set())
                    setShowCheckboxes(false)
                  }}
                >
                  Cancel
                </Button>
              )}

              {/* Delete button */}
              {hasSelection && (
                <Button
                  size="sm"
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleDeleteSelected}
                >
                  Delete ({selectedIds.size})
                </Button>
              )}

              {/* Edit button */}
              <Button
                size="sm"
                variant="light"
                color="blue"
                leftSection={<IconEdit size={14} />}
                onClick={handleStartGridEdit}
              >
                Edit
              </Button>

              {/* Add Server button */}
              <Button
                size="sm"
                leftSection={<IconPlus size={14} />}
                onClick={() => setIsAdding(true)}
                style={{ backgroundColor: '#2563EB' }}
              >
                Add Server
              </Button>
            </>
          )}
        </Group>
      </Group>

      {/* Table */}
      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader color="#5375BF" />
        </Box>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" m="md">{error}</Alert>
      ) : (
        <ScrollArea scrollbarSize={8}>
          <table style={{ minWidth: 3600, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ backgroundColor: '#F8FAFC' }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #E3E8EF',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        {header.column.getIsSorted() === 'asc'  ? <IconChevronUp   size={12} color="#5375BF" /> :
                         header.column.getIsSorted() === 'desc' ? <IconChevronDown size={12} color="#5375BF" /> :
                         header.column.getCanSort()             ? <IconSelector    size={12} color="#adb5bd" /> : null}
                      </Group>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {/* Data rows */}
              {table.getRowModel().rows.map((row, i) => {
                const isSelected   = selectedIds.has(row.original.ci_id)
                const isRowEditing = isGridEditing
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.original.ci_id)}
                    style={{
                      backgroundColor: isRowEditing
                        ? '#EFF6FF'
                        : isSelected
                        ? '#DBEAFE'
                        : i % 2 === 0 ? 'white' : '#FAFBFC',
                      cursor: isGridEditing ? 'default' : 'pointer',
                      borderLeft: isSelected ? '3px solid #2563EB' : isRowEditing ? '3px solid #93C5FD' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isRowEditing)
                        e.currentTarget.style.backgroundColor = '#F0F4FF'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isRowEditing)
                        e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#FAFBFC'
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          padding: '9px 16px',
                          whiteSpace: 'nowrap',
                          borderBottom: '1px solid #F1F5F9',
                          fontSize: 13,
                          color: '#374151',
                        }}
                        onClick={(e) => {
                          if (isRowEditing) e.stopPropagation()
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}

              {/* Inline Add Row */}
              {isAdding && (
                <tr style={{ backgroundColor: '#EFF6FF', borderLeft: '3px solid #2563EB' }}>
                  <td style={{ padding: '8px 16px' }} />
                  <td style={{ padding: '8px 16px' }}>
                    <Text size="xs" c="dimmed" fs="italic">Auto</Text>
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="CI Name *" value={newForm.ci_name} onChange={(e) => setNewField('ci_name', e.target.value)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.status} onChange={(v) => setNewField('status', v ?? 'Active')} data={['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']} style={{ minWidth: 180 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="CI Type" value={newForm.ci_type ?? ''} onChange={(e) => setNewField('ci_type', e.target.value || null)} style={{ minWidth: 100 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.environment} onChange={(v) => setNewField('environment', v ?? 'Production')} data={['Production','Staging','Testing / QA','Development','DR / Failover']} style={{ minWidth: 160 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Hostname / IP" value={newForm.hostname ?? ''} onChange={(e) => setNewField('hostname', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Operating System" value={newForm.operating_system ?? ''} onChange={(e) => setNewField('operating_system', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="OS Version" value={newForm.os_version ?? ''} onChange={(e) => setNewField('os_version', e.target.value || null)} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Patch Level" value={newForm.patch_level ?? ''} onChange={(e) => setNewField('patch_level', e.target.value || null)} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="number" placeholder="CPU Cores" value={newForm.cpu_cores?.toString() ?? ''} onChange={(e) => setNewField('cpu_cores', e.target.value ? parseInt(e.target.value) : null)} style={{ minWidth: 80 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="number" placeholder="RAM (GB)" value={newForm.ram_gb?.toString() ?? ''} onChange={(e) => setNewField('ram_gb', e.target.value ? parseInt(e.target.value) : null)} style={{ minWidth: 80 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="number" placeholder="Storage (TB)" value={newForm.storage_tb?.toString() ?? ''} onChange={(e) => setNewField('storage_tb', e.target.value ? parseFloat(e.target.value) : null)} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.virtualized ? 'Yes' : 'No'} onChange={(v) => setNewField('virtualized', v === 'Yes')} data={['Yes','No']} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Location / Data Center" value={newForm.location ?? ''} onChange={(e) => setNewField('location', e.target.value || null)} style={{ minWidth: 150 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Rack / Slot" value={newForm.rack_slot ?? ''} onChange={(e) => setNewField('rack_slot', e.target.value || null)} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.criticality} onChange={(v) => setNewField('criticality', v ?? 'Medium')} data={['Critical','High','Medium','Low']} style={{ minWidth: 120 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Business Service" value={newForm.business_service ?? ''} onChange={(e) => setNewField('business_service', e.target.value || null)} style={{ minWidth: 130 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Assigned Owner" value={newForm.assigned_owner ?? ''} onChange={(e) => setNewField('assigned_owner', e.target.value || null)} style={{ minWidth: 130 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Department" value={newForm.department ?? ''} onChange={(e) => setNewField('department', e.target.value || null)} style={{ minWidth: 110 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Manufacturer" value={newForm.manufacturer ?? ''} onChange={(e) => setNewField('manufacturer', e.target.value || null)} style={{ minWidth: 120 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Model" value={newForm.model ?? ''} onChange={(e) => setNewField('model', e.target.value || null)} style={{ minWidth: 110 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Serial Number" value={newForm.serial_number ?? ''} onChange={(e) => setNewField('serial_number', e.target.value || null)} style={{ minWidth: 120 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Asset Tag" value={newForm.asset_tag ?? ''} onChange={(e) => setNewField('asset_tag', e.target.value || null)} style={{ minWidth: 100 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="date" value={newForm.purchase_date ?? ''} onChange={(e) => setNewField('purchase_date', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="date" value={newForm.warranty_expiry ?? ''} onChange={(e) => setNewField('warranty_expiry', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="date" value={newForm.eol_date ?? ''} onChange={(e) => setNewField('eol_date', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" type="date" value={newForm.last_config_review ?? ''} onChange={(e) => setNewField('last_config_review', e.target.value || null)} style={{ minWidth: 140 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.baseline_applied ? 'Yes' : 'No'} onChange={(v) => setNewField('baseline_applied', v === 'Yes')} data={['Yes','No']} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.backup_enabled ? 'Yes' : 'No'} onChange={(v) => setNewField('backup_enabled', v === 'Yes')} data={['Yes','No']} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <Select size="xs" value={newForm.monitoring_siem ? 'Yes' : 'No'} onChange={(v) => setNewField('monitoring_siem', v === 'Yes')} data={['Yes','No']} style={{ minWidth: 90 }} />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <TextInput size="xs" placeholder="Notes" value={newForm.notes ?? ''} onChange={(e) => setNewField('notes', e.target.value || null)} style={{ minWidth: 180 }} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <Group justify="center" mt="md">
          <Pagination value={page} onChange={setPage} total={lastPage} color="#5375BF" size="sm" />
        </Group>
      )}
    </Box>
  )
}