import { useState, useMemo } from 'react'
import {
  Box, Text, Badge, ScrollArea, Button, Modal,
  TextInput, Select, Group, SimpleGrid
} from '@mantine/core'
import { IconPlus, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'

interface Server {
  id: string
  name: string
  status: 'Active' | 'Decommissioned' | 'EOL' | 'In Procurement' | 'In Deployment' | 'Maintenance'
  ciType: string
  environment: 'Production' | 'Staging' | 'Testing / QA' | 'Development' | 'DR / Failover'
  hostname: string
  os: string
  osVersion: string
  patchLevel: string
  cpuCore: string
  ram: string
  storage: string
  virtualized: 'Yes' | 'No'
  location: string
  rack: string
  criticality: 'Critical' | 'High' | 'Medium' | 'Low'
  service: string
  assignedOwner: string
  department: string
  manufacturer: string
  model: string
  serialNumber: string
  assetTag: string
  purchaseDate: string
  warrantyExpiry: string
  eolDate: string
  lastConfigReview: string
  baselineApplied: 'Yes' | 'No'
  backupEnabled: 'Yes' | 'No'
  monitoring: 'Yes' | 'No'
  notes: string
}

const statusColor: Record<Server['status'], string> = {
  Active:           'green',
  Decommissioned:   'gray',
  EOL:              'red',
  'In Procurement': 'orange',
  'In Deployment':  'blue',
  Maintenance:      'yellow',
}

const criticalityColor: Record<Server['criticality'], string> = {
  Critical: 'red',
  High:     'orange',
  Medium:   'yellow',
  Low:      'blue',
}

const initialData: Server[] = [
  {
    id: 'SRV-001', name: 'web-prod-01', status: 'Active', ciType: 'Physical',
    environment: 'Production', hostname: '192.168.1.10', os: 'Ubuntu', osVersion: '22.04',
    patchLevel: 'Latest', cpuCore: '16', ram: '32 GB', storage: '1 TB',
    virtualized: 'No', location: 'Manila', rack: 'R-12', criticality: 'Critical',
    service: 'Web Hosting', assignedOwner: 'Carlos M.', department: 'IT',
    manufacturer: 'Dell', model: 'PowerEdge R740', serialNumber: 'SN-ABC123',
    assetTag: 'AT-001', purchaseDate: '2022-01-15', warrantyExpiry: '2025-01-15',
    eolDate: '2027-01-15', lastConfigReview: '2026-01-10', baselineApplied: 'Yes',
    backupEnabled: 'Yes', monitoring: 'Yes', notes: 'Primary web server',
  },
  {
    id: 'SRV-002', name: 'db-prod-01', status: 'Active', ciType: 'Physical',
    environment: 'Production', hostname: '192.168.1.11', os: 'RHEL', osVersion: '9.0',
    patchLevel: 'Latest', cpuCore: '32', ram: '64 GB', storage: '4 TB',
    virtualized: 'No', location: 'Manila', rack: 'R-13', criticality: 'Critical',
    service: 'Database', assignedOwner: 'Ana R.', department: 'IT',
    manufacturer: 'HP', model: 'ProLiant DL380', serialNumber: 'SN-DEF456',
    assetTag: 'AT-002', purchaseDate: '2022-03-10', warrantyExpiry: '2025-03-10',
    eolDate: '2027-03-10', lastConfigReview: '2026-02-01', baselineApplied: 'Yes',
    backupEnabled: 'Yes', monitoring: 'Yes', notes: 'Primary DB',
  },
  {
    id: 'SRV-003', name: 'app-staging-01', status: 'Maintenance', ciType: 'Virtual',
    environment: 'Staging', hostname: '192.168.1.12', os: 'Ubuntu', osVersion: '20.04',
    patchLevel: 'Pending', cpuCore: '8', ram: '16 GB', storage: '500 GB',
    virtualized: 'Yes', location: 'Cebu', rack: 'R-05', criticality: 'Medium',
    service: 'App Server', assignedOwner: 'Ben T.', department: 'IT',
    manufacturer: 'Dell', model: 'PowerEdge R640', serialNumber: 'SN-GHI789',
    assetTag: 'AT-003', purchaseDate: '2021-06-20', warrantyExpiry: '2024-06-20',
    eolDate: '2026-06-20', lastConfigReview: '2025-12-01', baselineApplied: 'No',
    backupEnabled: 'Yes', monitoring: 'Yes', notes: 'Staging env',
  },
]

const emptyForm = (): Omit<Server, 'id'> => ({
  name: '', status: 'Active', ciType: '', environment: 'Production',
  hostname: '', os: '', osVersion: '', patchLevel: '', cpuCore: '',
  ram: '', storage: '', virtualized: 'No', location: '', rack: '',
  criticality: 'Medium', service: '', assignedOwner: '', department: '',
  manufacturer: '', model: '', serialNumber: '', assetTag: '',
  purchaseDate: '', warrantyExpiry: '', eolDate: '', lastConfigReview: '',
  baselineApplied: 'No', backupEnabled: 'No', monitoring: 'No', notes: '',
})

const columnHelper = createColumnHelper<Server>()

export default function Servers() {
  const [data, setData]           = useState<Server[]>(initialData)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState<Omit<Server, 'id'>>(emptyForm())
  const [sorting, setSorting]     = useState<SortingState>([])

  const set = (key: keyof Omit<Server, 'id'>, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleAdd = () => {
    const newId = `SRV-${String(data.length + 1).padStart(3, '0')}`
    setData((prev) => [...prev, { id: newId, ...form }])
    setForm(emptyForm())
    setModalOpen(false)
  }

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (i) => <Text size="sm" fw={600} c="#5375BF" ff="monospace">{i.getValue()}</Text>,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (i) => <Text size="sm" fw={500} c="#0F172A">{i.getValue()}</Text>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (i) => (
        <Badge color={statusColor[i.getValue()]} variant="light" size="sm">
          {i.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('ciType',           { header: 'CI Type'                   }),
    columnHelper.accessor('environment',      { header: 'Environment'               }),
    columnHelper.accessor('hostname',         { header: 'Hostname'                  }),
    columnHelper.accessor('os',               { header: 'OS'                        }),
    columnHelper.accessor('osVersion',        { header: 'OS Version'                }),
    columnHelper.accessor('patchLevel',       { header: 'Patch Level'               }),
    columnHelper.accessor('cpuCore',          { header: 'CPU Core'                  }),
    columnHelper.accessor('ram',              { header: 'RAM'                       }),
    columnHelper.accessor('storage',          { header: 'Storage'                   }),
    columnHelper.accessor('virtualized',      { header: 'Virtualized'               }),
    columnHelper.accessor('location',         { header: 'Location'                  }),
    columnHelper.accessor('rack',             { header: 'Rack'                      }),
    columnHelper.accessor('criticality', {
      header: 'Criticality',
      cell: (i) => (
        <Badge color={criticalityColor[i.getValue()]} variant="light" size="sm">
          {i.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('service',          { header: 'Service'                   }),
    columnHelper.accessor('assignedOwner',    { header: 'Assigned Owner'            }),
    columnHelper.accessor('department',       { header: 'Department'                }),
    columnHelper.accessor('manufacturer',     { header: 'Manufacturer'              }),
    columnHelper.accessor('model',            { header: 'Model'                     }),
    columnHelper.accessor('serialNumber',     { header: 'Serial Number'             }),
    columnHelper.accessor('assetTag',         { header: 'Asset Tag'                 }),
    columnHelper.accessor('purchaseDate',     { header: 'Purchase Date'             }),
    columnHelper.accessor('warrantyExpiry',   { header: 'Warranty Expiry'           }),
    columnHelper.accessor('eolDate',          { header: 'EOL Date'                  }),
    columnHelper.accessor('lastConfigReview', { header: 'Last Configuration Review' }),
    columnHelper.accessor('baselineApplied',  { header: 'Baseline Applied'          }),
    columnHelper.accessor('backupEnabled',    { header: 'Backup Enabled'            }),
    columnHelper.accessor('monitoring',       { header: 'Monitoring'                }),
    columnHelper.accessor('notes',            { header: 'Notes'                     }),
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Box p="xl">
      {/* Toolbar */}
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          {(['Active', 'Decommissioned', 'EOL', 'In Procurement', 'In Deployment', 'Maintenance'] as Server['status'][]).map((s) => (
            <Badge key={s} color={statusColor[s]} variant="light" size="sm">
              {s}: {data.filter((r) => r.status === s).length}
            </Badge>
          ))}
          <Text size="sm" c="dimmed">Total: {data.length}</Text>
        </Group>
        <Button
          size="sm"
          leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpen(true)}
          style={{ backgroundColor: '#5375BF' }}
        >
          Add Server
        </Button>
      </Group>

      {/* Table */}
      <Box style={{
        backgroundColor: 'white',
        borderRadius: 8,
        border: '1px solid #E3E8EF',
        overflow: 'hidden',
      }}>
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
      </Box>

      {/* Add Server Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={700} size="md">Add New Server</Text>}
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <SimpleGrid cols={2} spacing="sm">
          <TextInput label="Name"                   value={form.name}             onChange={(e) => set('name', e.target.value)}             placeholder="web-prod-03"     />
          <TextInput label="CI Type"                value={form.ciType}           onChange={(e) => set('ciType', e.target.value)}           placeholder="Physical"        />
          <Select
            label="Status"
            value={form.status}
            onChange={(v) => set('status', v ?? 'Active')}
            data={['Active', 'Decommissioned', 'EOL', 'In Procurement', 'In Deployment', 'Maintenance']}
          />
          <Select
            label="Environment"
            value={form.environment}
            onChange={(v) => set('environment', v ?? 'Production')}
            data={['Production', 'Staging', 'Testing / QA', 'Development', 'DR / Failover']}
          />
          <TextInput label="Hostname / IP"          value={form.hostname}         onChange={(e) => set('hostname', e.target.value)}         placeholder="192.168.1.x"     />
          <TextInput label="OS"                     value={form.os}               onChange={(e) => set('os', e.target.value)}               placeholder="Ubuntu"          />
          <TextInput label="OS Version"             value={form.osVersion}        onChange={(e) => set('osVersion', e.target.value)}        placeholder="22.04"           />
          <TextInput label="Patch Level"            value={form.patchLevel}       onChange={(e) => set('patchLevel', e.target.value)}       placeholder="Latest"          />
          <TextInput label="CPU Core"               value={form.cpuCore}          onChange={(e) => set('cpuCore', e.target.value)}          placeholder="16"              />
          <TextInput label="RAM"                    value={form.ram}              onChange={(e) => set('ram', e.target.value)}              placeholder="32 GB"           />
          <TextInput label="Storage"                value={form.storage}          onChange={(e) => set('storage', e.target.value)}          placeholder="1 TB"            />
          <Select
            label="Virtualized"
            value={form.virtualized}
            onChange={(v) => set('virtualized', v ?? 'No')}
            data={['Yes', 'No']}
          />
          <TextInput label="Location"               value={form.location}         onChange={(e) => set('location', e.target.value)}         placeholder="Manila"          />
          <TextInput label="Rack"                   value={form.rack}             onChange={(e) => set('rack', e.target.value)}             placeholder="R-12"            />
          <Select
            label="Criticality"
            value={form.criticality}
            onChange={(v) => set('criticality', v ?? 'Medium')}
            data={['Critical', 'High', 'Medium', 'Low']}
          />
          <TextInput label="Service"                value={form.service}          onChange={(e) => set('service', e.target.value)}          placeholder="Web Hosting"     />
          <TextInput label="Assigned Owner"         value={form.assignedOwner}    onChange={(e) => set('assignedOwner', e.target.value)}    placeholder="Carlos M."       />
          <TextInput label="Department"             value={form.department}       onChange={(e) => set('department', e.target.value)}       placeholder="IT"              />
          <TextInput label="Manufacturer"           value={form.manufacturer}     onChange={(e) => set('manufacturer', e.target.value)}     placeholder="Dell"            />
          <TextInput label="Model"                  value={form.model}            onChange={(e) => set('model', e.target.value)}            placeholder="PowerEdge R740"  />
          <TextInput label="Serial Number"          value={form.serialNumber}     onChange={(e) => set('serialNumber', e.target.value)}     placeholder="SN-XXXXXX"       />
          <TextInput label="Asset Tag"              value={form.assetTag}         onChange={(e) => set('assetTag', e.target.value)}         placeholder="AT-001"          />
          <TextInput label="Purchase Date"          value={form.purchaseDate}     onChange={(e) => set('purchaseDate', e.target.value)}     placeholder="2024-01-01"      />
          <TextInput label="Warranty Expiry"        value={form.warrantyExpiry}   onChange={(e) => set('warrantyExpiry', e.target.value)}   placeholder="2027-01-01"      />
          <TextInput label="EOL Date"               value={form.eolDate}          onChange={(e) => set('eolDate', e.target.value)}          placeholder="2028-01-01"      />
          <TextInput label="Last Config Review"     value={form.lastConfigReview} onChange={(e) => set('lastConfigReview', e.target.value)} placeholder="2026-01-01"      />
          <Select
            label="Baseline Applied"
            value={form.baselineApplied}
            onChange={(v) => set('baselineApplied', v ?? 'No')}
            data={['Yes', 'No']}
          />
          <Select
            label="Backup Enabled"
            value={form.backupEnabled}
            onChange={(v) => set('backupEnabled', v ?? 'No')}
            data={['Yes', 'No']}
          />
          <Select
            label="Monitoring"
            value={form.monitoring}
            onChange={(v) => set('monitoring', v ?? 'No')}
            data={['Yes', 'No']}
          />
          <TextInput
            label="Notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any additional notes"
            style={{ gridColumn: 'span 2' }}
          />
        </SimpleGrid>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!form.name || !form.hostname}
            style={{ backgroundColor: '#5375BF' }}
          >
            Add Server
          </Button>
        </Group>
      </Modal>
    </Box>
  )
}