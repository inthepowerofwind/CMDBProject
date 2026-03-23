import React, { useState, useEffect, useCallback } from 'react'
import { notifications } from '@mantine/notifications'
import {
  Box, Text, Badge, ScrollArea, Button, Modal, Loader,
  TextInput, Select, Group, Alert, Pagination,
  SimpleGrid, Table, ActionIcon,
} from '@mantine/core'
import {
  IconAlertCircle, IconPlus, IconChevronDown, IconChevronRight,
} from '@tabler/icons-react'
import {
  changeLogService,
  ChangeLog as ChangeLogEntry,
  ChangeLogPayload,
  ChangeLogListParams,
} from '../api/changeLogService'

const CHANGE_TYPE_COLOR: Record<string, string> = {
  'Created':               'green',
  'Deleted':               'red',
  'Restored':              'teal',
  'Updated':               'blue',
  'Status Change':         'blue',
  'Patch Update':          'cyan',
  'OS Update':             'cyan',
  'Firmware Update':       'cyan',
  'Version Update':        'cyan',
  'Ownership Change':      'orange',
  'Location Change':       'orange',
  'Environment Change':    'orange',
  'Criticality Change':    'red',
  'Classification Change': 'grape',
  'Tier Change':           'violet',
  'Cost Update':           'yellow',
  'License Update':        'yellow',
  'Compliance Update':     'yellow',
  'SLA Update':            'yellow',
  'Rename':                'gray',
}

const CI_TABLES = [
  'servers', 'network_devices', 'endpoints',
  'software', 'cloud_services', 'databases',
]

const emptyForm = (): ChangeLogPayload => ({
  ci_id: '', ci_name: '', ci_table: 'servers',
  change_type: 'Updated', change_description: null,
  change_by: '', rfs_reference: null,
  approved_by: null, previous_values: null, new_values: null,
})

function DiffTable({ prev, next }: {
  prev: Record<string, unknown> | null
  next: Record<string, unknown> | null
}) {
  const keys = Array.from(new Set([
    ...Object.keys(prev ?? {}),
    ...Object.keys(next ?? {}),
  ]))
  if (keys.length === 0) return <Text size="xs" c="dimmed">No field details available.</Text>
  return (
    <Table withTableBorder withColumnBorders fz="xs" style={{ fontSize: 12 }}>
      <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
        <Table.Tr>
          <Table.Th style={{ width: '30%' }}>Field</Table.Th>
          <Table.Th style={{ width: '35%', color: '#e53e3e' }}>Previous</Table.Th>
          <Table.Th style={{ width: '35%', color: '#2e6fdb' }}>New</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {keys.map((key) => {
          const oldVal = prev?.[key] ?? null
          const newVal = next?.[key] ?? null
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal)
          return (
            <Table.Tr key={key} style={{ backgroundColor: changed ? '#FFFBEB' : 'white' }}>
              <Table.Td fw={500}>{key}</Table.Td>
              <Table.Td c={oldVal === null ? 'dimmed' : '#e53e3e'}>
                {oldVal === null ? '—' : String(oldVal)}
              </Table.Td>
              <Table.Td c={newVal === null ? 'dimmed' : '#2e6fdb'}>
                {newVal === null ? '—' : String(newVal)}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '9px 16px', whiteSpace: 'nowrap',
  borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#374151',
}

function LogRow({ log, index }: { log: ChangeLogEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const hasDiff = log.previous_values || log.new_values
  return (
    <>
      <tr
        style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFBFC', cursor: hasDiff ? 'pointer' : 'default' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F4FF')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#FAFBFC')}
        onClick={() => hasDiff && setOpen((o) => !o)}
      >
        <td style={tdStyle}>
          <Group gap={4}>
            {hasDiff && (
              <ActionIcon size="xs" variant="subtle" color="gray">
                {open ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              </ActionIcon>
            )}
            <Text size="xs" fw={600} c="#5375BF" ff="monospace">{log.change_log_id}</Text>
          </Group>
        </td>
        <td style={tdStyle}><Text size="xs" fw={500}>{log.ci_id}</Text></td>
        <td style={tdStyle}><Text size="xs">{log.ci_name}</Text></td>
        <td style={tdStyle}><Badge variant="light" color="gray" size="xs">{log.ci_table}</Badge></td>
        <td style={tdStyle}>
          <Badge variant="light" size="xs" color={CHANGE_TYPE_COLOR[log.change_type] ?? 'blue'}>
            {log.change_type}
          </Badge>
        </td>
        <td style={tdStyle}>
          <Text size="xs" c="dimmed" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {log.change_description ?? '—'}
          </Text>
        </td>
        <td style={tdStyle}><Text size="xs">{log.change_by}</Text></td>
        <td style={tdStyle}><Text size="xs" c="dimmed">{log.rfs_reference ?? '—'}</Text></td>
        <td style={tdStyle}><Text size="xs" c="dimmed">{log.approved_by ?? '—'}</Text></td>
        <td style={tdStyle}>
          <Text size="xs" c="dimmed">{new Date(log.created_at).toLocaleString()}</Text>
        </td>
      </tr>
      {open && hasDiff && (
        <tr style={{ backgroundColor: '#F8FAFC' }}>
          <td colSpan={10} style={{ padding: '12px 24px' }}>
            <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Field Changes
            </Text>
            <DiffTable prev={log.previous_values} next={log.new_values} />
          </td>
        </tr>
      )}
    </>
  )
}

export default function ChangeLog() {
  const [logs, setLogs]               = useState<ChangeLogEntry[]>([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [lastPage, setLastPage]       = useState(1)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState<string | null>(null)
  const [filterTable, setFilterTable] = useState<string | null>(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [form, setForm]               = useState<ChangeLogPayload>(emptyForm())
  const [saving, setSaving]           = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: ChangeLogListParams = {
        page, per_page: 25,
        search:      search || undefined,
        change_type: filterType  || undefined,
        ci_table:    filterTable || undefined,
        sort_by: 'created_at', sort_dir: 'desc',
      }
      const result = await changeLogService.list(params)
      setLogs(result.data)
      setTotal(result.total)
      setLastPage(result.last_page)
    } catch {
      setError('Failed to load change logs.')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterType, filterTable])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const setField = (key: keyof ChangeLogPayload, value: unknown) =>
    setForm((f: ChangeLogPayload) => ({ ...f, [key]: value } as ChangeLogPayload))

  const handleAdd = async () => {
    setSaving(true)
    try {
      const created = await changeLogService.create(form)
      setLogs((prev) => [created, ...prev])
      setTotal((t) => t + 1)
      setForm(emptyForm())
      setModalOpen(false)
      notifications.show({ color: 'green', message: `${created.change_log_id} created.` })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to create log entry.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box p="xl">
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          <TextInput
            placeholder="Search by ID, CI, type, changed by..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            size="sm" style={{ width: 280 }}
          />
          <Select
            placeholder="Filter by type" value={filterType}
            onChange={(v) => { setFilterType(v); setPage(1) }}
            data={Object.keys(CHANGE_TYPE_COLOR)}
            clearable size="sm" style={{ width: 180 }}
          />
          <Select
            placeholder="Filter by CI table" value={filterTable}
            onChange={(v) => { setFilterTable(v); setPage(1) }}
            data={CI_TABLES} clearable size="sm" style={{ width: 160 }}
          />
          <Text size="sm" c="dimmed">Total: {total}</Text>
        </Group>
        <Button size="sm" leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpen(true)} style={{ backgroundColor: '#5375BF' }}>
          Manual Entry
        </Button>
      </Group>

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader color="#5375BF" />
        </Box>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" m="md">{error}</Alert>
      ) : (
        <Box style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #E3E8EF', overflow: 'hidden' }}>
          <ScrollArea scrollbarSize={8}>
            <table style={{ minWidth: 1400, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  {['Log ID','CI ID','CI Name','CI Table','Change Type','Description','Changed By','RFS Reference','Approved By','Date & Time'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E3E8EF' }}>
                      <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>{h}</Text>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>No change log entries found.</td></tr>
                ) : logs.map((log, i) => (
                  <LogRow key={log.change_log_id} log={log} index={i} />
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Box>
      )}

      {lastPage > 1 && (
        <Group justify="center" mt="md">
          <Pagination value={page} onChange={setPage} total={lastPage} color="#5375BF" size="sm" />
        </Group>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)}
        title={<Text fw={700} size="md">Manual Log Entry</Text>}
        size="lg" scrollAreaComponent={ScrollArea.Autosize}>
        <SimpleGrid cols={2} spacing="sm">
          <TextInput label="CI ID *"        value={form.ci_id} onChange={(e)                    => setField('ci_id', e.target.value)}                 placeholder="SRV-001" />
          <TextInput label="CI Name *"      value={form.ci_name} onChange={(e)                  => setField('ci_name', e.target.value)}               placeholder="DC01-PROD" />
          <Select    label="CI Table *"     value={form.ci_table} onChange={(v)                 => setField('ci_table', v ?? 'servers')}              data={CI_TABLES} />
          <TextInput label="Change Type *"  value={form.change_type} onChange={(e)              => setField('change_type', e.target.value)}           placeholder="Planned Maintenance" />
          <TextInput label="Changed By *"   value={form.change_by} onChange={(e)                => setField('change_by', e.target.value)}             placeholder="Carlos M." />
          <TextInput label="RFS Reference"  value={form.rfs_reference ?? ''} onChange={(e)      => setField('rfs_reference', e.target.value || null)} placeholder="RFS-2026-001" />
          <TextInput label="Approved By"    value={form.approved_by ?? ''} onChange={(e)        => setField('approved_by', e.target.value || null)}   placeholder="Ana R." />
          <TextInput label="Description"    value={form.change_description ?? ''} onChange={(e) => setField('change_description', e.target.value || null)}
            placeholder="Planned downtime for patching" style={{ gridColumn: 'span 2' }} />
        </SimpleGrid>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} loading={saving}
            disabled={!form.ci_id || !form.ci_name || !form.change_by}
            style={{ backgroundColor: '#5375BF' }}>Save Entry</Button>
        </Group>
      </Modal>
    </Box>
  )
}