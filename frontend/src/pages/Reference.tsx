import { Box, Card, Text, Grid, ActionIcon, Group, TextInput, Button, Tooltip } from '@mantine/core'
import { IconTrash, IconPlus, IconCheck, IconX } from '@tabler/icons-react'

import { useState } from 'react'
import { ReferenceTable, ReferenceRow } from '../api/referenceService'
import { referenceTables as initialData } from '../data/referenceData'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

interface EditingCell {
  tableId: string
  rowId:   string
  column:  string
}

interface EditableTableProps {
  table:       ReferenceTable
  onUpdateRow: (tableId: string, rowId: string, column: string, value: string) => void
  onDeleteRow: (tableId: string, rowId: string) => void
  onAddRow:    (tableId: string) => void
}

function EditableTable({ table, onUpdateRow, onDeleteRow, onAddRow }: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
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
              <th
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #e9ecef',
                  width: 40,
                }}
              />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                style={{ background: rowIndex % 2 === 0 ? '#fff' : '#f8fafc' }}
              >
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
                      <Text
                        size="xs"
                        c={row[col] ? '#1a2b4a' : 'dimmed'}
                        style={{ minHeight: 20 }}
                      >
                        {row[col] || '—'}
                      </Text>
                    )}
                  </td>
                ))}

                {/* Delete row action */}
                <td
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid #e9ecef',
                    textAlign: 'center',
                  }}
                >
                  <Tooltip label="Delete row" withArrow position="left">
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
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
                <td
                  colSpan={table.columns.length + 1}
                  style={{ padding: '24px 12px', textAlign: 'center' }}
                >
                  <Text size="xs" c="dimmed">No rows yet. Click + to add one.</Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      <Group justify="flex-end" mt="sm">
        <Button
          size="xs"
          variant="subtle"
          color="blue"
          leftSection={<IconPlus size={13} />}
          onClick={() => onAddRow(table.id)}
        >
          Add row
        </Button>
      </Group>
    </Card>
  )
}

export default function Reference() {
  const [tables, setTables] = useState<ReferenceTable[]>(initialData)

  function handleUpdateRow(tableId: string, rowId: string, column: string, value: string) {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId) return table
        return {
          ...table,
          rows: table.rows.map((row) => {
            if (row.id !== rowId) return row
            return { ...row, [column]: value }
          }),
        }
      })
    )
  }

  function handleDeleteRow(tableId: string, rowId: string) {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId) return table
        return {
          ...table,
          rows: table.rows.filter((row) => row.id !== rowId),
        }
      })
    )
  }

  function handleAddRow(tableId: string) {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId) return table
        const emptyRow: ReferenceRow = { id: generateId() }
        table.columns.forEach((col) => { emptyRow[col] = '' })
        return { ...table, rows: [...table.rows, emptyRow] }
      })
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