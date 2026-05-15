import { useState, useEffect, useCallback } from 'react'
import {
  Box, Card, Text, Grid, ActionIcon, Group, Stack,
  TextInput, Button, Tooltip, Loader, Alert, Modal,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconTrash, IconPlus, IconCheck, IconX,
  IconRefresh, IconAlertCircle, IconAlertTriangle,
} from '@tabler/icons-react'
import referenceService, { ReferenceTable, ReferenceRow } from '../api/referenceService'

// Constants

// Maximum characters allowed per cell; prevents long text from breaking the layout
const MAX_CELL_LENGTH = 100

// Helpers

function generateTempId() {
  return `temp_${Math.random().toString(36).slice(2, 9)}`
}

// Types

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

// EditableTable

function EditableTable({
  table, saving,
  onUpdateRow, onDeleteRow, onAddRow,
}: EditableTableProps) {
  const [editingCell, setEditingCell]   = useState<EditingCell | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // True when the current input value exceeds the character limit
  const isOverLimit = editingValue.length > MAX_CELL_LENGTH

  function handleCellClick(rowId: string, column: string, currentValue: string) {
    setEditingCell({ tableId: table.id, rowId, column })
    setEditingValue(currentValue)
  }

  function handleSave() {
    if (!editingCell) return

    // Block save if the value is empty
    if (!editingValue.trim()) {
      notifications.show({ color: 'red', message: 'Field value cannot be empty. Please try again.' })
      return
    }

    // Block save if the value exceeds the character limit
    if (isOverLimit) {
      notifications.show({
        color:   'red',
        message: `Field value must be ${MAX_CELL_LENGTH} characters or fewer.`,
      })
      return
    }

    onUpdateRow(editingCell.tableId, editingCell.rowId, editingCell.column, editingValue.trim())
    setEditingCell(null)
    setEditingValue('')
  }

  function handleDiscard() {
    // If the user discards a brand-new empty row, remove it entirely
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
    <Card mb="lg" shadow="sm" radius="md" withBorder mt="xl">
      <Text fw={600} mb="md" c="#1a2b4a">{table.title}</Text>

      <Box style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>

          {/* Header */}
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {table.columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding:       '8px 12px',
                    textAlign:     'left',
                    fontWeight:    600,
                    color:         '#1a2b4a',
                    borderBottom:  '1px solid #e9ecef',
                    borderRight:   '1px solid #e9ecef',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #e9ecef', width: 40 }} />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row.id} style={{ background: rowIndex % 2 === 0 ? '#fff' : '#f8fafc' }}>
                {table.columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding:      '6px 12px',
                      borderBottom: '1px solid #e9ecef',
                      borderRight:  '1px solid #e9ecef',
                      cursor:       'text',
                      // Fixed width prevents long text from stretching the column
                      minWidth:     120,
                      maxWidth:     300,
                    }}
                    onClick={() => {
                      if (!isEditing(row.id, col)) {
                        handleCellClick(row.id, col, row[col] ?? '')
                      }
                    }}
                  >
                    {isEditing(row.id, col) ? (
                      <Stack gap={2}>
                        <Group gap={4} wrap="nowrap">
                          <TextInput
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.currentTarget.value)}
                            onKeyDown={handleKeyDown}
                            size="xs"
                            autoFocus
                            // maxLength gives instant browser-level enforcement
                            // on top of the save-time validation
                            maxLength={MAX_CELL_LENGTH + 1}
                            error={isOverLimit}
                            style={{ flex: 1, minWidth: 80 }}
                            styles={{ input: { fontSize: 12, padding: '2px 8px', height: 28 } }}
                          />
                          <ActionIcon
                            size="sm" color="green" variant="subtle"
                            onClick={handleSave}
                            disabled={isOverLimit}
                          >
                            <IconCheck size={13} />
                          </ActionIcon>
                          <ActionIcon size="sm" color="gray" variant="subtle" onClick={handleDiscard}>
                            <IconX size={13} />
                          </ActionIcon>
                        </Group>

                        {/* Character counter - turns red when over the limit */}
                        <Text
                          size="xs"
                          ta="right"
                          c={isOverLimit ? 'red' : 'dimmed'}
                          style={{ lineHeight: 1 }}
                        >
                          {editingValue.length}/{MAX_CELL_LENGTH}
                          {isOverLimit && ' — too long'}
                        </Text>
                      </Stack>
                    ) : (
                      // Read-only display - truncates with ellipsis if text is long
                      <Text
                        size="xs"
                        c={row[col] ? '#1a2b4a' : 'dimmed'}
                        style={{
                          minHeight:    20,
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace:   'nowrap',
                          maxWidth:     280,
                        }}
                        title={row[col] || undefined}  // full text on hover
                      >
                        {row[col] || '—'}
                      </Text>
                    )}
                  </td>
                ))}

                {/* Delete button */}
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

            {/* Empty state */}
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

// Reference page

export default function Reference() {
  const [tables, setTables]   = useState<ReferenceTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete]     = useState<{ tableId: string; rowId: string } | null>(null)

  const [savingTables, setSavingTables] = useState<Record<string, boolean>>({})

  // Data fetching

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

  // Saving helpers

  const startSaving = (tableId: string) =>
    setSavingTables((prev) => ({ ...prev, [tableId]: true }))

  const stopSaving = (tableId: string) =>
    setSavingTables((prev) => ({ ...prev, [tableId]: false }))

  // Handlers

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
      setTables(tables) // revert optimistic update on error
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

    // Temp rows (unsaved new rows) don't need a backend call
    if (rowId.startsWith('temp_')) return

    startSaving(tableId)
    try {
      await referenceService.deleteRow(tableId, index)
      notifications.show({ color: 'orange', message: 'Row deleted.' })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete row.' })
      setTables(tables) // revert on error
    } finally {
      stopSaving(tableId)
    }
  }

  function handleDeleteClick(tableId: string, rowId: string) {
    setPendingDelete({ tableId, rowId })
    setDeleteModalOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return
    setDeleteModalOpen(false)
    await handleDeleteRow(pendingDelete.tableId, pendingDelete.rowId)
    setPendingDelete(null)
  }

  function handleAddRow(tableId: string) {
    const table = tables.find((t) => t.id === tableId)!
    const emptyRow: ReferenceRow = { id: generateTempId() }
    table.columns.forEach((col) => { emptyRow[col] = '' })

    setTables((prev) =>
      prev.map((t) => t.id === tableId ? { ...t, rows: [...t.rows, emptyRow] } : t)
    )
  }

  // Render

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

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        withCloseButton={false}
        centered size="sm" radius="md"
        overlayProps={{ blur: 2, backgroundOpacity: 0.35 }}
      >
        <Stack align="center" gap="md">
          <Box style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#FFF1F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconAlertTriangle size={26} color="#E03131" />
          </Box>

          <Stack align="center" gap={4}>
            <Text fw={700} size="md" c="#0F172A">Confirm Delete</Text>
            <Text size="sm" c="dimmed" ta="center">
              Are you sure you want to delete <strong>this row</strong>?
              Once deleted, you cannot restore this anymore.
            </Text>
          </Stack>

          <Group justify="center" gap="sm" w="100%" mt={4}>
            <Button variant="default" size="sm" style={{ flex: 1 }} onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" size="sm" style={{ flex: 1 }} onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Tables */}
      <Grid>
        <Grid.Col>
          {tables.map((table) => (
            <EditableTable
              key={table.id}
              table={table}
              saving={savingTables[table.id] ?? false}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteClick}
              onAddRow={handleAddRow}
            />
          ))}
        </Grid.Col>
      </Grid>
    </Box>
  )
}