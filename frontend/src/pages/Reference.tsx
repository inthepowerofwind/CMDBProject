import { useState, useEffect, useCallback } from 'react'
import {
  Box, Card, Text, Grid, ActionIcon, Group,
  TextInput, Button, Tooltip, Loader, Alert,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconTrash, IconPlus, IconCheck, IconX,
  IconRefresh, IconAlertCircle,
} from '@tabler/icons-react'

import referenceService from '../api/referenceService'
import { ReferenceTable, ReferenceRow } from '../api/referenceService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTempId() {
  return `temp_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Editable Table ───────────────────────────────────────────────────────────

interface EditingCell {
  tableId: string
  rowId:   string
  column:  string
}

interface EditableTableProps {
  table:       ReferenceTable
  saving:      boolean
  onUpdateRow: (tableId: string, rowId: string, column: string, value: string) => void
  onDeleteRow: (tableId: string, rowId: string) => void
  onAddRow:    (tableId: string) => void
}

function EditableTable({
  table, saving,
  onUpdateRow, onDeleteRow, onAddRow,
}: EditableTableProps) {
  const [editingCell, setEditingCell]   = useState<EditingCell | null>(null)
  const [editingValue, setEditingValue] = useState('')

  function handleCellClick(rowId: string, column: string, currentValue: string) {
    setEditingCell({ tableId: table.id, rowId, column })
    setEditingValue(currentValue)
  }

  function handleSave() {
    if (!editingCell) return
    onUpdateRow(editingCell.tableId, editingCell.rowId, editingCell.column, editingValue)
    setEditingCell(null)
    setEditingValue('')
  }

  function handleDiscard() {
    if (editingCell) {
      const row = table.rows.find((r) => r.id === editingCell.rowId)
      const isNewEmptyRow = row && table.columns.every((col) => !row[col])
      if (isNewEmptyRow) {
        onDeleteRow(table.id, editingCell.rowId)
      }
    }
    setEditingCell(null)
    setEditingValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  handleSave()
    if (e.key === 'Escape') handleDiscard()
  }

  const isEditing = (rowId: string, column: string) =>
    editingCell?.tableId === table.id &&
    editingCell?.rowId   === rowId    &&
    editingCell?.column  === column

  return (
    <Card mb="lg" shadow="sm" radius="md" withBorder>
      <Text fw={600} mb="md" c="#1a2b4a">{table.title}</Text>

      <Box style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {table.columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#1a2b4a',
                    borderBottom: '1px solid #e9ecef',
                    borderRight: '1px solid #e9ecef',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #e9ecef', width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row.id} style={{ background: rowIndex % 2 === 0 ? '#fff' : '#f8fafc' }}>
                {table.columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: '6px 12px',
                      borderBottom: '1px solid #e9ecef',
                      borderRight: '1px solid #e9ecef',
                      cursor: 'text',
                      minWidth: 120,
                    }}
                    onClick={() => {
                      if (!isEditing(row.id, col)) {
                        handleCellClick(row.id, col, row[col] ?? '')
                      }
                    }}
                  >
                    {isEditing(row.id, col) ? (
                      <Group gap={4} wrap="nowrap">
                        <TextInput
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.currentTarget.value)}
                          onKeyDown={handleKeyDown}
                          size="xs"
                          autoFocus
                          style={{ flex: 1, minWidth: 80 }}
                          styles={{ input: { fontSize: 12, padding: '2px 8px', height: 28 } }}
                        />
                        <ActionIcon size="sm" color="green" variant="subtle" onClick={handleSave}>
                          <IconCheck size={13} />
                        </ActionIcon>
                        <ActionIcon size="sm" color="gray" variant="subtle" onClick={handleDiscard}>
                          <IconX size={13} />
                        </ActionIcon>
                      </Group>
                    ) : (
                      <Text size="xs" c={row[col] ? '#1a2b4a' : 'dimmed'} style={{ minHeight: 20 }}>
                        {row[col] || '—'}
                      </Text>
                    )}
                  </td>
                ))}

                <td style={{ padding: '6px 8px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                  <Tooltip label="Delete row" withArrow position="left">
                    <ActionIcon
                      size="sm" color="red" variant="subtle"
                      onClick={() => onDeleteRow(table.id, row.id)}
                    >
                      <IconTrash size={13} />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))}

            {table.rows.length === 0 && (
              <tr>
                <td colSpan={table.columns.length + 1} style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <Text size="xs" c="dimmed">No rows yet. Click + to add one.</Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      <Group justify="flex-end" mt="sm">
        <Button
          size="xs" variant="subtle" color="blue"
          leftSection={<IconPlus size={13} />}
          onClick={() => onAddRow(table.id)}
          loading={saving}
        >
          Add row
        </Button>
      </Group>
    </Card>
  )
}

// ─── Main Reference Page ──────────────────────────────────────────────────────

export default function Reference() {
  const [tables, setTables]   = useState<ReferenceTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [savingTables, setSavingTables] = useState<Record<string, boolean>>({})

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await referenceService.getAll()
      setTables(data)
    } catch {
      setError('Failed to load reference data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function startSaving(tableId: string) {
    setSavingTables((prev) => ({ ...prev, [tableId]: true }))
  }
  function stopSaving(tableId: string) {
    setSavingTables((prev) => ({ ...prev, [tableId]: false }))
  }

  async function handleUpdateRow(tableId: string, rowId: string, column: string, value: string) {
    const updatedTables = tables.map((t) => {
      if (t.id !== tableId) return t
      return {
        ...t,
        rows: t.rows.map((r) => r.id === rowId ? { ...r, [column]: value } : r),
      }
    })
    setTables(updatedTables)

    const table = updatedTables.find((t) => t.id === tableId)!
    startSaving(tableId)
    try {
      await referenceService.replaceTable(tableId, table.rows)
      notifications.show({ color: 'green', message: 'Row updated.' })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save changes.' })
      setTables(tables)
    } finally {
      stopSaving(tableId)
    }
  }

  async function handleDeleteRow(tableId: string, rowId: string) {
    const table = tables.find((t) => t.id === tableId)!
    const index = table.rows.findIndex((r) => r.id === rowId)
    if (index === -1) return

    const updatedRows = table.rows.filter((r) => r.id !== rowId)
    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, rows: updatedRows } : t)
    )

    if (rowId.startsWith('temp_')) return

    startSaving(tableId)
    try {
      await referenceService.deleteRow(tableId, index)
      notifications.show({ color: 'orange', message: 'Row deleted.' })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete row.' })
      setTables(tables)
    } finally {
      stopSaving(tableId)
    }
  }

  async function handleAddRow(tableId: string) {
    const table = tables.find((t) => t.id === tableId)!
    const emptyRow: ReferenceRow = { id: generateTempId() }
    table.columns.forEach((col) => { emptyRow[col] = '' })

    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, rows: [...t.rows, emptyRow] } : t)
    )
  }

  if (loading) {
    return (
      <Box p="xl" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Loader color="#5375BF" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>
        <Button variant="light" size="sm" leftSection={<IconRefresh size={14} />} onClick={fetchAll}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box p="xl">
      <Grid>
        <Grid.Col>
          {tables.map((table) => (
            <EditableTable
              key={table.id}
              table={table}
              saving={savingTables[table.id] ?? false}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              onAddRow={handleAddRow}
            />
          ))}
        </Grid.Col>
      </Grid>
    </Box>
  )
}