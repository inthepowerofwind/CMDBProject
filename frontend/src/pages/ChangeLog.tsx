import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Text, Badge, Loader,
  TextInput, Select, Group, Alert, Pagination, Table, ActionIcon,
  ScrollArea,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertCircle, IconChevronDown, IconChevronRight,
} from '@tabler/icons-react'
import {
  changeLogService,
  ChangeLog as ChangeLogEntry,
  ChangeLogListParams,
} from '../api/changeLogService'

// Change Type color
function getChangeTypeColor(changeType: string): string {
  // Direct match first
  if (CHANGE_TYPE_COLOR[changeType]) return CHANGE_TYPE_COLOR[changeType]
  // default color
  return 'blue'
}

// Change Type color; blue for not specified change type
const CHANGE_TYPE_COLOR: Record<string, string> = {
  'Created':               'green',
  'Deleted':               'red',
  'Restored':              'yellow',
  'Updated':               'blue',
  'Status Change':         'blue',
  'Patch Update':          'cyan',
  'OS Update':             'cyan',
  'Firmware Update':       'cyan',
  'Version Update':        'cyan',
  'Ownership Change':      'blue',
  'Location Change':       'blue',
  'Environment Change':    'blue',
  'Criticality Change':    'violet',
  'Classification Change': 'violet',
  'Tier Change':           'violet',
  'Cost Update':           'yellow',
  'License Update':        'yellow',
  'Compliance Update':     'yellow',
  'SLA Update':            'yellow',
  'Rename':                'blue',
}

const CI_TABLES = [
  'Servers', 'Network_Devices', 'Endpoints',
  'Software', 'Cloud_Services', 'Databases',
]

// formats ISO date strings to MM/DD/YYYY; returns a dash if empty
// timestamp splitting
const formatLogValue = (v: unknown): string => {
  if (v === null || v === undefined) return '—'
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.split('T')[0].split('-')
    return `${m}/${d}/${y}`
  }
  return s
}

// Field Changes table - shows the changes (previous and new data) when expanded
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
          <Table.Th style={{ width: '35%', color: 'gray' }}>Previous</Table.Th>
          <Table.Th style={{ width: '35%', color: 'green' }}>New</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {keys.map((key, i) => {
          const oldVal = prev?.[key] ?? null
          const newVal = next?.[key] ?? null
          return (
            <Table.Tr key={key} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
              <Table.Td fw={500}>{key}</Table.Td>
              <Table.Td c={oldVal === null ? 'dimmed' : 'gray'}>
                {formatLogValue(oldVal)}
              </Table.Td>
              <Table.Td c={newVal === null ? 'dimmed' : 'green'}>
                {formatLogValue(newVal)}
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '11px 16px',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #F1F5F9',
  fontSize: 13,
  color: '#374151',
}

// field change expand function: automatically closes 
// other field change table when another field is expanded
function LogRow({ log, index, isOpen, onToggle }: {
  log: ChangeLogEntry
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const hasDiff = log.previous_values || log.new_values
  return (
    <>
      <tr
        style={{
          backgroundColor: index % 2 === 0 ? 'white' : '#FAFBFC',
          cursor: hasDiff ? 'pointer' : 'default',
          borderLeft: '3px solid transparent',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F4FF')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#FAFBFC')}
        onClick={() => hasDiff && onToggle()}
      >
        {/* Field Change expand */}
        <td style={tdStyle}>
          <Group gap={4} wrap="nowrap">
            {hasDiff && (
              <ActionIcon size="xs" variant="subtle" color="gray">
                {isOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              </ActionIcon>
            )}
            <Text size="xs" fw={600} c="#5375BF" ff="monospace">{log.change_log_id}</Text>
          </Group>
        </td>
        <td style={tdStyle}><Text size="sm">{log.ci_id}</Text></td>
        <td style={{ ...tdStyle, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <Text size="sm" truncate>{log.ci_name}</Text>
        </td>
        <td style={tdStyle}>
          <Badge variant="light" color="gray" size="sm" style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}>
            {log.ci_table}
          </Badge>
        </td>
        <td style={tdStyle}>
          {/* when change types overflow; shows one change type and + icon and number for addtional change types */}
          <Group gap={4} wrap="nowrap">
            {(() => {
              const types = log.change_type.split(',').map((s) => s.trim())
              const visible = types.slice(0, 1)
              const overflow = types.length - 1
              return (
                <>
                  {visible.map((t) => (
                    <Badge
                      key={t}
                      variant="light"
                      size="sm"
                      color={getChangeTypeColor(t)}
                      style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}
                    >
                      {t}
                    </Badge>
                  ))}
                  {overflow > 0 && (
                    <Badge
                      variant="light"
                      size="sm"
                      color="gray"
                      title={types.slice(1).join(', ')}
                      style={{ whiteSpace: 'nowrap', display: 'inline-flex', cursor: 'default' }}
                    >
                      +{overflow}
                    </Badge>
                  )}
                </>
              )
            })()}
          </Group>
        </td>
        <td style={{ ...tdStyle, overflow: 'hidden', maxWidth: 100 }}>
          <Tooltip label={log.change_description ?? '—'} position="bottom" withArrow openDelay={300}>
            <Text size="sm" c="dimmed" truncate="end">{log.change_description ?? '—'}</Text>
          </Tooltip>
        </td>
        <td style={tdStyle}><Text size="sm">{log.change_by}</Text></td>
        {/* <td style={tdStyle}><Text size="sm" c="dimmed">{log.rfs_reference ?? '—'}</Text></td> */}
        {/* <td style={tdStyle}><Text size="sm" c="dimmed">{log.approved_by ?? '—'}</Text></td> */}
        <td style={tdStyle}>
          <Text size="sm" c="dimmed">{new Date(log.created_at).toLocaleString()}</Text>
        </td>
      </tr>

      {/* Expandable diff row - shows field-level changes, previous and new data */}
      {isOpen && hasDiff && (
        <tr style={{ backgroundColor: '#F8FAFC' }}>
          <td colSpan={10} style={{ padding: '12px 24px', borderBottom: '1px solid #F1F5F9' }}>
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

// Change Log
export default function ChangeLog() {
  const [logs, setLogs]               = useState<ChangeLogEntry[]>([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [lastPage, setLastPage]       = useState(1)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [filterTable, setFilterTable] = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [perPage, setPerPage]         = useState<number>(15)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: ChangeLogListParams = {
        page,
        per_page: perPage === 0 ? 99999 : perPage,
        search:      search      || undefined,
        ci_table:    filterTable || undefined,
        sort_by: 'created_at', sort_dir: 'desc',
      }
      const result = await changeLogService.list(params)
      setLogs(result.data)
      setTotal(result.total)
      setLastPage(result.last_page)
    } catch (err: any) {
      console.error('Change log error:', err?.response?.status, err?.response?.data)
      setError('Failed to load change logs.')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterTable, perPage])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Table column headers
  const HEADERS = [
    'Log ID', 'CI ID', 'CI Name', 'CI Table', 'Change Type',
    'Description', 'Changed By', 'Date & Time',
  ]

  return (
    <Box p="xl">

      {/* Toolbar */}
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          <TextInput
            placeholder="Search by ID, CI, type, changed by..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            size="sm" style={{ width: 280 }}
          />

          <Select
            placeholder="Filter by CI table"
            value={filterTable}
            onChange={(v) => { setFilterTable(v); setPage(1) }}
            data={CI_TABLES}
            clearable size="sm" style={{ width: 160 }}
          />
          <Text size="sm" c="dimmed">Total: {total}</Text>
        </Group>
      </Group>

      {/* Table */}
      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader color="#5375BF" />
        </Box>
      ) : error ? (
        <>
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Could not load data. Make sure the backend server is running.
          </Text>
        </>
      ) : (
        // Change Log table
        <ScrollArea scrollbarSize={8}>
          <table style={{ minWidth: 1000, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '10%' }} /> {/* Log ID */}
              <col style={{ width: '6%'  }} /> {/* CI ID */}
              <col style={{ width: '9%'  }} /> {/* CI Name */}
              <col style={{ width: '10%' }} /> {/* CI Table */}
              <col style={{ width: '12%' }} /> {/* Change Type */}
              <col style={{ width: '30%' }} /> {/* Description */}
              <col style={{ width: '10%' }} /> {/* Changed By */}
              <col style={{ width: '13%' }} /> {/* Date & Time */}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #E3E8EF',
                      userSelect: 'none',
                    }}
                  >
                    <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                      {h}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={HEADERS.length} style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                    No change log entries found.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <LogRow
                    key={log.change_log_id}
                    log={log}
                    index={i}
                    isOpen={expandedId === log.change_log_id}
                    onToggle={() => setExpandedId(
                      expandedId === log.change_log_id ? null : log.change_log_id
                    )}
                  />
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      )}

      {/* Pagination */}
      {(lastPage > 1 || true) && (
        <Group justify="center" mt="md" align="center">
          <Select
            value={String(perPage)}
            onChange={(v) => { setPerPage(Number(v ?? 15)); setPage(1) }}
            data={[
              { value: '15', label: '15 / page' },
              { value: '30', label: '30 / page' },
              { value: '60', label: '60 / page' },
              { value: '0',  label: 'All' },
            ]}
            size="xs" style={{ width: 110 }}
            allowDeselect={false}
          />
          {lastPage > 1 && (
            <Pagination value={page} onChange={setPage} total={lastPage} color="blue" size="sm" />
          )}
        </Group>
      )}
    </Box>
  )
}