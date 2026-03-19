import { useState, useMemo, useEffect, useCallback } from 'react'
import { notifications } from '@mantine/notifications'
import { serverService, Server, ServerPayload } from '../api/serverService'
import {
  Box, Text, Badge, ScrollArea, Button, Modal, Loader,
  TextInput, Select, Group, SimpleGrid, Alert,
  ActionIcon, Pagination, Tooltip,
} from '@mantine/core'
import {
  IconPlus, IconChevronUp, IconChevronDown, IconSelector,
  IconTrash, IconRefresh, IconAlertCircle,
} from '@tabler/icons-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'
//import { SearchBar } from '../components/SearchBar'


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
})

const columnHelper = createColumnHelper<Server>()

export default function Servers() {
  const [servers, setServers]     = useState<Server[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [search, setSearch]       = useState('')   
  const [sorting, setSorting]     = useState<SortingState>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState<ServerPayload>(emptyForm())
  const [saving, setSaving]       = useState(false)

  const sortBy  = sorting[0]?.id
  const sortDir = (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc'

const fetchServers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page, per_page: 25,
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

  const setField = (key: keyof ServerPayload, value: unknown) =>
  setForm((f: ServerPayload) => ({ ...f, [key]: value } as ServerPayload))

  const handleAdd = async () => {
    setSaving(true)
    try {
      const created = await serverService.create(form)
      setServers((prev) => [created, ...prev])
      setTotal((t) => t + 1)
      setForm(emptyForm())
      setModalOpen(false)
      notifications.show({ color: 'green', message: `${created.ci_id} added.` })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to add server.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ciId: string) => {
    try {
      await serverService.delete(ciId)
      setServers((prev) => prev.filter((s) => s.ci_id !== ciId))
      setTotal((t) => t - 1)
      notifications.show({ color: 'orange', message: `${ciId} deleted.` })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete.' })
    }
  }

  const handleRestore = async (ciId: string) => {
    try {
      const restored = await serverService.restore(ciId)
      setServers((prev) => prev.map((s) => s.ci_id === ciId ? restored : s))
      notifications.show({ color: 'green', message: `${ciId} restored.` })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to restore.' })
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('ci_id',             { header: 'ID', cell : (i) => <Text size="sm" c="dimmed">{i.getValue()}</Text> }),
    columnHelper.accessor('ci_name',          { header: 'Name', cell: (i) => <Text fw={500}>{i.getValue()}</Text> }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (i) => (
        <Badge color={statusColor[i.getValue()]} variant="light" size="sm">
          {i.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('ci_type',          { header: 'CI Type'  }),
    columnHelper.accessor('environment',      { header: 'Environment'               }),
    columnHelper.accessor('hostname',         { header: 'Hostname'                  }),
    columnHelper.accessor('operating_system', { header: 'OS'                        }),
    columnHelper.accessor('os_version',       { header: 'OS Version'                }),
    columnHelper.accessor('patch_level',      { header: 'Patch Level'               }),
    columnHelper.accessor('cpu_cores',         { header: 'CPU Core'                  }),
    columnHelper.accessor('ram_gb',           { header: 'RAM'                       }),
    columnHelper.accessor('storage_tb',       { header: 'Storage'                   }),
    columnHelper.accessor('virtualized',      { header: 'Virtualized'               }),
    columnHelper.accessor('location',         { header: 'Location'                  }),
    columnHelper.accessor('rack_slot',        { header: 'Rack'                      }),
    columnHelper.accessor('criticality', {
      header: 'Criticality',
      cell: (i) => i.getValue() ? (
        <Badge color={criticalityColor[i.getValue()!] ?? 'gray'} variant="light" size="sm">
          {i.getValue()}
        </Badge>
      ) : '—',
    }),
    columnHelper.accessor('business_service', { header: 'Service'                   }),
    columnHelper.accessor('assigned_owner',   { header: 'Assigned Owner'            }),
    columnHelper.accessor('department',       { header: 'Department'                }),
    columnHelper.accessor('manufacturer',     { header: 'Manufacturer'              }),
    columnHelper.accessor('model',            { header: 'Model'                     }),
    columnHelper.accessor('serial_number',    { header: 'Serial Number'             }),
    columnHelper.accessor('asset_tag',        { header: 'Asset Tag'                 }),
    columnHelper.accessor('purchase_date',    { header: 'Purchase Date'             }),
    columnHelper.accessor('warranty_expiry',  { header: 'Warranty Expiry'           }),
    columnHelper.accessor('eol_date',         { header: 'EOL Date'                  }),
    columnHelper.accessor('last_config_review',{ header: 'Last Configuration Review' }),
    columnHelper.accessor('baseline_applied', { header: 'Baseline Applied'          }),
    columnHelper.accessor('backup_enabled',   { header: 'Backup Enabled'            }),
    columnHelper.accessor('monitoring_siem',  { header: 'Monitoring'                }),
    columnHelper.accessor('notes', { header: 'Notes' }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Delete" withArrow>
            <ActionIcon size="sm" variant="subtle" color="red"
              onClick={() => handleDelete(row.original.ci_id)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Restore" withArrow>
            <ActionIcon size="sm" variant="subtle" color="green"
              onClick={() => handleRestore(row.original.ci_id)}>
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    }),
  ], [])

  const table = useReactTable({
    data: servers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  //const [search, setSearch] = useState('')

  return (
    <Box p="xl">
      {/* Toolbar */}
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          <TextInput
            placeholder="Search by ID, name, OS..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            size="sm" style={{ width: 240 }}
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPage(1) }}
            data={['Active','Decommissioned','EOL','In Procurement','In Deployment','Maintenance']}
            clearable size="sm" style={{ width: 180 }}
          />
          <Text size="sm" c="dimmed">Total: {total}</Text>
        </Group>
        <Button
          size="sm"
          leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpen(true)}
          style={{ backgroundColor: '#2563EB', display: 'flex', justifyContent: 'flex-end'}}
        >
          Add Server
        </Button>
      </Group>

      {/* Table */}
      {loading ? (
        <Box style={{ display:'flex', justifyContent:'center', padding: 60 }}>
          <Loader color="#5375BF" />
        </Box>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16}/>} color="red" m="md">{error}</Alert>
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
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid #E3E8EF',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                    >
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        {header.column.getIsSorted() === 'asc'  ? <IconChevronUp   size={12} color="#5375BF" /> :
                         header.column.getIsSorted() === 'desc' ? <IconChevronDown size={12} color="#5375BF" /> :
                         <IconSelector size={12} color="#adb5bd" />}
                      </Group>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F4FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#FAFBFC')}
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
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
      {lastPage > 1 && (
        <Group justify="center" mt="md">
          <Pagination value={page} onChange={setPage} total={lastPage} color="#5375BF" size="sm" />
        </Group>
      )}

      {/* Add Server Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={700} size="md">Add New Server</Text>}
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <SimpleGrid cols={2} spacing="sm">
          <TextInput label="Name"                   value={form.ci_name}             onChange={(e) => setField('ci_name', e.target.value)}             placeholder="web-prod-03"     />
          <TextInput label="CI Type"                value={form.ci_type ?? ''}           onChange={(e) => setField('ci_type', e.target.value || null)}           placeholder="Physical"        />
          <Select
            label="Status"
            value={form.status}
            onChange={(v) => setField('status', v ?? 'Active')}
            data={['Active', 'Decommissioned', 'EOL', 'In Procurement', 'In Deployment', 'Maintenance']}
          />
          <Select
            label="Environment"
            value={form.environment}
            onChange={(v) => setField('environment', v ?? 'Production')}
            data={['Production', 'Staging', 'Testing / QA', 'Development', 'DR / Failover']}
          />
          <TextInput label="Hostname / IP"          value={form.hostname ?? ''}         onChange={(e) => setField('hostname', e.target.value || null)}         placeholder="192.168.1.x"     />
          <TextInput label="OS"                     value={form.operating_system ?? ''}  onChange={(e) => setField('operating_system', e.target.value || null)}               placeholder="Ubuntu"          />
          <TextInput label="OS Version"             value={form.os_version ?? ''}        onChange={(e) => setField('os_version', e.target.value || null)}        placeholder="22.04"           />
          <TextInput label="Patch Level"            value={form.patch_level ?? ''}       onChange={(e) => setField('patch_level', e.target.value || null)}       placeholder="Latest"          />
          <TextInput label="CPU Core"               value={form.cpu_cores?.toString() ?? ''}    type="number"     onChange={(e) => setField('cpu_cores', e.target.value ? parseInt(e.target.value) : null)}          placeholder="16"              />
          <TextInput label="RAM"                    value={form.ram_gb?.toString() ?? ''}    type="number"        onChange={(e) => setField('ram_gb', e.target.value ? parseInt(e.target.value) : null)}              placeholder="32"           />
          <TextInput label="Storage"                value={form.storage_tb?.toString() ?? ''}    type="number"    onChange={(e) => setField('storage_tb', e.target.value ? parseFloat(e.target.value) : null)}          placeholder="1"            />
          <Select
            label="Virtualized"
            value={form.virtualized ? 'Yes' : 'No'}
            onChange={(v) => setField('virtualized', v === 'Yes')}
            data={['Yes', 'No']}
          />
          <TextInput label="Location"               value={form.location ?? ''}         onChange={(e) => setField('location', e.target.value || null)}         placeholder="Manila"          />
          <TextInput label="Rack"                   value={form.rack_slot ?? ''}             onChange={(e) => setField('rack_slot', e.target.value || null)}             placeholder="R-12"            />
          <Select
            label="Criticality"
            value={form.criticality}
            onChange={(v) => setField('criticality', v ?? 'Medium')}
            data={['Critical', 'High', 'Medium', 'Low']}
          />
          <TextInput label="Service"                value={form.business_service ?? ''}          onChange={(e) => setField('business_service', e.target.value || null)}          placeholder="Web Hosting"     />
          <TextInput label="Assigned Owner"         value={form.assigned_owner ?? ''}    onChange={(e) => setField('assigned_owner', e.target.value || null)}    placeholder="Carlos M."       />
          <TextInput label="Department"             value={form.department ?? ''}       onChange={(e) => setField('department', e.target.value || null)}       placeholder="IT"              />
          <TextInput label="Manufacturer"           value={form.manufacturer ?? ''}     onChange={(e) => setField('manufacturer', e.target.value || null)}     placeholder="Dell"            />
          <TextInput label="Model"                  value={form.model ?? ''}            onChange={(e) => setField('model', e.target.value || null)}            placeholder="PowerEdge R740"  />
          <TextInput label="Serial Number"          value={form.serial_number ?? ''}     onChange={(e) => setField('serial_number', e.target.value || null)}     placeholder="SN-XXXXXX"       />
          <TextInput label="Asset Tag"              value={form.asset_tag ?? ''}         onChange={(e) => setField('asset_tag', e.target.value || null)}         placeholder="AT-001"          />
          <TextInput label="Purchase Date"          value={form.purchase_date ?? ''}     onChange={(e) => setField('purchase_date', e.target.value || null)}     placeholder="2024-01-01"      />
          <TextInput label="Warranty Expiry"        value={form.warranty_expiry ?? ''}   onChange={(e) => setField('warranty_expiry', e.target.value || null)}   placeholder="2027-01-01"      />
          <TextInput label="EOL Date"               value={form.eol_date ?? ''}          onChange={(e) => setField('eol_date', e.target.value || null)}          placeholder="2028-01-01"      />
          <TextInput label="Last Config Review"     value={form.last_config_review ?? ''} onChange={(e) => setField('last_config_review', e.target.value || null)} placeholder="2026-01-01"      />
          <Select
            label="Baseline Applied"
            value={form.baseline_applied ? 'Yes' : 'No'}
            onChange={(v) => setField('baseline_applied', v === 'Yes')}
            data={['Yes', 'No']}
          />
          <Select
            label="Backup Enabled"
            value={form.backup_enabled ? 'Yes' : 'No'}
            onChange={(v) => setField('backup_enabled', v === 'Yes')}
            data={['Yes', 'No']}
          />
          <Select
            label="Monitoring"
            value={form.monitoring_siem ? 'Yes' : 'No'}
            onChange={(v) => setField('monitoring_siem', v === 'Yes')}
            data={['Yes', 'No']}
          />
          <TextInput
            label="Notes"
            value={form.notes ?? ''}
            onChange={(e) => setField('notes', e.target.value || null)}
            placeholder="Any additional notes"
            style={{ gridColumn: 'span 2' }}
          />
        </SimpleGrid>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            loading={saving}
            disabled={!form.ci_name}
            style={{ backgroundColor: '#5375BF' }}
          >
            Add Server
          </Button>
        </Group>
      </Modal>
    </Box>
  )
}