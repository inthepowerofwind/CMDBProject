import { useEffect, useState } from 'react'
import {
  Grid, Card, Text, Box, Table, ActionIcon, Group,
  Button, Modal, TextInput, Stack, Tooltip, Loader,
  Center, Alert
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconTrash, IconPlus, IconRefresh, IconCheck, IconAlertCircle } from '@tabler/icons-react'
import axios from 'axios'

// ─── Types ────────────────────────────────────────────────────────────────────

type Row = Record<string, string>

interface TableConfig {
  key: string
  label: string
  columns: { field: string; header: string }[]
}

// ─── Table configuration ──────────────────────────────────────────────────────

const TABLE_CONFIGS: TableConfig[] = [
  {
    key: 'ci_status',
    label: 'CI Status Values',
    columns: [
      { field: 'status_code',           header: 'Status Code' },
      { field: 'description',           header: 'Description' },
      { field: 'allowed_in_production', header: 'Allowed in Production' },
      { field: 'color_code',            header: 'Color Code' },
    ],
  },
  {
    key: 'criticality_levels',
    label: 'CI Criticality Levels',
    columns: [
      { field: 'criticality',      header: 'Criticality' },
      { field: 'definition',       header: 'Definition' },
      { field: 'rto_target',       header: 'RTO Target' },
      { field: 'review_frequency', header: 'Review Frequency' },
    ],
  },
  {
    key: 'environments',
    label: 'CI Environment Values',
    columns: [
      { field: 'environment',               header: 'Environment' },
      { field: 'description',               header: 'Description' },
      { field: 'live_data_allowed',          header: 'Live Data Allowed' },
      { field: 'change_approval_required',   header: 'Change Approval Required' },
    ],
  },
  {
    key: 'data_classifications',
    label: 'Data Classification',
    columns: [
      { field: 'classification',    header: 'Classification' },
      { field: 'description',       header: 'Description' },
      { field: 'encryption_required', header: 'Encryption Required' },
      { field: 'external_sharing',  header: 'External Sharing' },
    ],
  },
  {
    key: 'relationship_types',
    label: 'Relationship Types',
    columns: [
      { field: 'relationship_type', header: 'Relationship Type' },
      { field: 'description',       header: 'Description' },
    ],
  },
]

// ─── Row Modal ────────────────────────────────────────────────────────────────

interface RowModalProps {
  opened: boolean
  onClose: () => void
  config: TableConfig
  editRow: Row | null      // null = add mode
  editIndex: number | null
  onSave: (row: Row, index: number | null) => Promise<void>
}

function RowModal({ opened, onClose, config, editRow, editIndex, onSave }: RowModalProps) {
  const [values, setValues] = useState<Row>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (opened) {
      setValues(editRow ? { ...editRow } : Object.fromEntries(config.columns.map(c => [c.field, ''])))
    }
  }, [opened, editRow, config])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(values, editIndex)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editRow ? 'Edit Row' : 'Add Row'}
      size="md"
    >
      <Stack>
        {config.columns.map(col => (
          <TextInput
            key={col.field}
            label={col.header}
            value={values[col.field] ?? ''}
            onChange={e => { const val = e.currentTarget.value; setValues(v => ({ ...v, [col.field]: val })) }}
          />
        ))}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} leftSection={<IconCheck size={16} />}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

// ─── Reference Table Card ─────────────────────────────────────────────────────

interface ReferenceCardProps {
  config: TableConfig
  rows: Row[]
  onUpdate: (tableKey: string, rows: Row[]) => Promise<void>
  onAddRow: (tableKey: string, row: Row) => Promise<void>
  onDeleteRow: (tableKey: string, index: number) => Promise<void>
  onReset: (tableKey: string) => Promise<void>
}

function ReferenceCard({ config, rows, onUpdate, onAddRow, onDeleteRow, onReset }: ReferenceCardProps) {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [editRow, setEditRow]     = useState<Row | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const handleEdit = (row: Row, index: number) => {
    setEditRow(row)
    setEditIndex(index)
    openModal()
  }

  const handleAdd = () => {
    setEditRow(null)
    setEditIndex(null)
    openModal()
  }

  const handleSave = async (row: Row, index: number | null) => {
    if (index !== null) {
      // Edit: replace row at index in full rows array
      const updated = rows.map((r, i) => (i === index ? row : r))
      await onUpdate(config.key, updated)
    } else {
      await onAddRow(config.key, row)
    }
  }

  return (
    <>
      <Card mb="lg" shadow="sm" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600} c="#1a2b4a">{config.label}</Text>
          <Group gap="xs">
            <Tooltip label="Add row">
              <ActionIcon variant="light" color="blue" onClick={handleAdd}>
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reset to defaults">
              <ActionIcon variant="light" color="orange" onClick={() => onReset(config.key)}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              {config.columns.map(col => (
                <Table.Th key={col.field}>{col.header}</Table.Th>
              ))}
              <Table.Th style={{ width: 80 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, i) => (
              <Table.Tr key={i}>
                {config.columns.map(col => (
                  <Table.Td key={col.field}>{row[col.field] ?? ''}</Table.Td>
                ))}
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Edit">
                      <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEdit(row, i)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon size="sm" variant="subtle" color="red" onClick={() => onDeleteRow(config.key, i)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <RowModal
        opened={modalOpened}
        onClose={closeModal}
        config={config}
        editRow={editRow}
        editIndex={editIndex}
        onSave={handleSave}
      />
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Reference() {
  const [data, setData]       = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/reference')
      setData(res.data)
    } catch {
      setError('Failed to load reference data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUpdate = async (tableKey: string, rows: Row[]) => {
    const res = await api.put(`/reference/${tableKey}`, { rows })
    setData(prev => ({ ...prev, [tableKey]: res.data.data }))
    notifications.show({ message: 'Row updated.', color: 'green', icon: <IconCheck size={16} /> })
  }

  const handleAddRow = async (tableKey: string, row: Row) => {
    const res = await api.post(`/reference/${tableKey}/rows`, row)
    setData(prev => ({ ...prev, [tableKey]: res.data.data }))
    notifications.show({ message: 'Row added.', color: 'green', icon: <IconCheck size={16} /> })
  }

  const handleDeleteRow = async (tableKey: string, index: number) => {
    const res = await api.delete(`/reference/${tableKey}/rows/${index}`)
    setData(prev => ({ ...prev, [tableKey]: res.data.data }))
    notifications.show({ message: 'Row deleted.', color: 'red' })
  }

  const handleReset = async (tableKey: string) => {
    const res = await api.delete(`/reference/${tableKey}/reset`)
    setData(prev => ({ ...prev, [tableKey]: res.data.data }))
    notifications.show({ message: 'Table reset to defaults.', color: 'orange', icon: <IconRefresh size={16} /> })
  }

  if (loading) return <Center h={300}><Loader /></Center>

  if (error) return (
    <Box p="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">{error}</Alert>
    </Box>
  )

  return (
    <Box p="xl">
      <Grid>
        <Grid.Col>
          {TABLE_CONFIGS.map(config => (
            <ReferenceCard
              key={config.key}
              config={config}
              rows={data[config.key] ?? []}
              onUpdate={handleUpdate}
              onAddRow={handleAddRow}
              onDeleteRow={handleDeleteRow}
              onReset={handleReset}
            />
          ))}
        </Grid.Col>
      </Grid>
    </Box>
  )
}