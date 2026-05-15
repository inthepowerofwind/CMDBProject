// Pure display layer for the CI table. Handles rendering the toolbar,
// column headers (with sorting), data rows, the inline add row, and pagination.

// All state and business logic lives in CITable.tsx.
// This component only receives data and callbacks via props.

import { useMemo } from 'react'
import {
  Box, Text, ScrollArea, Loader, Select, 
  Group, Alert, Tooltip, Checkbox, Pagination,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'

import { EditableCell } from './EditableCell'
import { TextDateCell } from './TextDateCell'
import { CITableProps, CIColumnDef, Indexable } from './CITable.types'
import { DATE_FIELDS, TEXT_DATE_FIELDS, formatDate } from './dateHelpers'

// Props

export interface TableViewProps<T extends object, P extends object> {
  // Data
  rows:         T[]
  total:        number
  page:         number
  lastPage:     number
  loading:      boolean
  error:        string

  // Column / field config
  idField:      keyof T & string
  colDefs:      CIColumnDef<T>[]
  addLabel:     string
  isArchiveView: boolean
  tableMinWidth: number
  booleanFields: string[]

  // Row selection
  selectedIds:  Set<string>
  allSelected:  boolean
  someSelected: boolean
  onSelectAll:  () => void
  onRowClick:   (id: string) => void

  // Grid edit 
  isGridEditing:  boolean
  editableIds:    Set<string>
  // Ref holding the live draft form values for every row being edited.
  editFormsRef:   React.MutableRefObject<Record<string, Partial<P>>>
  setGridField:   (id: string, key: string, value: unknown, rerender?: boolean) => void

  // Inline add row
  isAdding:     boolean
  newForm:      P
  setNewField:  (key: string, value: unknown) => void
  setNewForm:   React.Dispatch<React.SetStateAction<P>>
  // Ref holding the live new-form values for synchronous reads in callbacks.
  newFormRef:   React.MutableRefObject<P>

  // Pagination 
  onPageChange:    (p: number) => void
  perPage:         number
  onPerPageChange: (value: number) => void

  // Misc
  // Toolbar JSX rendered above the table (passed in from CITable).
  toolbar:      React.ReactNode
  // Called when the user presses Enter inside a cell (triggers add or save).
  onEnter?:     () => void
  // Allows module pages to override specific cells with custom inputs.
  cellOverride?: CITableProps<T, P>['cellOverride']

  // Sorting
  sorting:          SortingState
  onSortingChange:  React.Dispatch<React.SetStateAction<SortingState>>
}

// Helpers

// Maps a column key and type to the correct HTML input type string.
const resolveInputType = (colKey: string, colType?: string): string => {
  if (DATE_FIELDS.has(colKey)) return 'date'
  if (colType === 'number')    return 'number'
  return 'text'
}

// Component
export function TableView<T extends object, P extends object>({
  rows, page, total, lastPage, loading, error,
  idField, colDefs, addLabel, isArchiveView,
  selectedIds, allSelected, someSelected, onSelectAll, onRowClick,
  isGridEditing, editableIds, editFormsRef, booleanFields, setGridField,
  isAdding, newForm, setNewField, setNewForm, tableMinWidth,
  onPageChange, toolbar, newFormRef, onEnter, cellOverride,
  sorting, onSortingChange, perPage, onPerPageChange,
}: TableViewProps<T, P>) {

  const columnHelper = createColumnHelper<T>()

  // Column definitions
  
  // Builds the react-table column array: one checkbox column for selection,
  // then one column per CIColumnDef. Cells switch between read-only display
  // and editable inputs depending on whether grid edit mode is active.

  const columns = useMemo<ColumnDef<T, any>[]>(() => {
    const cols: ColumnDef<T, any>[] = []

    // Checkbox column - hidden during grid edit so it doesn't interfere with inputs.
    cols.push(columnHelper.display({
      id: '__select__',
      header: () => !isGridEditing ? (
        <Tooltip label={allSelected ? 'Deselect All' : 'Select All'} withArrow>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={onSelectAll}
            size="xs"
          />
        </Tooltip>
      ) : null,
      cell: ({ row }) => !isGridEditing ? (
        <Checkbox
          checked={selectedIds.has(String((row.original as Indexable<T>)[idField]))}
          onChange={() => onRowClick(String((row.original as Indexable<T>)[idField]))}
          size="xs"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null,
    }))

    // Data columns
    colDefs.forEach((col) => {
      cols.push(columnHelper.accessor(
        (row) => row[col.key],
        {
          id:     col.key,
          header: col.header,
          cell: ({ row }) => {
            const rowId   = String((row.original as Indexable<T>)[idField])
            const editing = isGridEditing && editableIds.has(rowId) && !col.readOnly

            // Read-only display
            if (!editing) {
              const raw = (row.original as Indexable<T>)[col.key]
              if (col.render)                return col.render(raw, row.original)
              if (DATE_FIELDS.has(col.key))  return <Text size="sm">{formatDate(raw)}</Text>
              if (TEXT_DATE_FIELDS.has(col.key)) return <Text size="sm">{formatDate(raw)}</Text>
              if (typeof raw === 'boolean')  return <Text size="sm">{raw ? 'Yes' : 'No'}</Text>
              return <Text size="sm">{(raw as string) ?? '—'}</Text>
            }

            // Editable cell
            // Falls back to the original row value if the edit form doesn't have this field yet
            const editForm = editFormsRef.current[rowId] as Indexable<P> | undefined
            const val = (editForm && col.key in editForm)
              ? editForm[col.key]
              : (row.original as Indexable<T>)[col.key]

            // Module pages can override any specific cell with custom JSX.
            if (cellOverride) {
              const formSnap = editFormsRef.current[rowId] as Partial<T & P> | undefined
              const setField = (key: string, value: unknown, rerender = false) =>
                setGridField(rowId, key, value, rerender)
              const override = cellOverride(col, rowId, val, formSnap, setField, onEnter)
              if (override != null) return override
            }

            // text/date input for fields like EOL Date, License Expiry.
            if (TEXT_DATE_FIELDS.has(col.key)) {
              return (
                <TextDateCell
                  value={val}
                  field={col.key}
                  width={col.width}
                  disabled={col.disabled}
                  onChange={(f, v, r) => setGridField(rowId, f, v, r)}
                  onEnter={onEnter}
                />
              )
            }

            // Default editable cell (text input, number input, date picker, or select).
            return (
              <EditableCell
                value={val}
                field={col.key}
                type={resolveInputType(col.key, col.type)}
                options={col.type === 'boolean' ? ['Yes', 'No'] : col.options}
                isEditing
                onChange={(f, v, r) => setGridField(rowId, f, v, r)}
                booleanFields={booleanFields}
                width={col.width}
                disabled={col.disabled}
                onEnter={onEnter}
                placeholder={col.placeholder}
              />
            )
          },
        }
      ))
    })

    return cols
  }, [colDefs, isGridEditing, editableIds, selectedIds, allSelected, someSelected, rows])

  // React Table instance

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    state: { sorting },
  })

  // Table content

  const renderTableContent = () => (
    <ScrollArea scrollbarSize={8}>
      <table style={{ minWidth: tableMinWidth, width: '100%', borderCollapse: 'collapse' }}>

        {/* Header */}
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} style={{ backgroundColor: '#F8FAFC' }}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '10px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                    borderBottom: '1px solid #E3E8EF', userSelect: 'none',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <Group gap={4} wrap="nowrap">
                    <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                    {header.column.getIsSorted() === 'asc'  && <Text size="xs" c="dimmed">↑</Text>}
                    {header.column.getIsSorted() === 'desc' && <Text size="xs" c="dimmed">↓</Text>}
                  </Group>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {rows.length === 0 && !isAdding ? (
            // Empty state message
            <tr>
              <td colSpan={colDefs.length + 1} style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                {isArchiveView
                  ? 'No archived records found.'
                  : <>No data yet. Click <strong>Add {addLabel?.replace('Add ', '') ?? 'Item'}</strong> to get started.</>
                }
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => {
              const rowId        = String((row.original as Indexable<T>)[idField])
              const isSelected   = selectedIds.has(rowId)
              const isRowEditing = isGridEditing && editableIds.has(rowId)

              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(rowId)}
                  style={{
                    backgroundColor: isRowEditing ? '#EFF6FF' : isSelected ? '#DBEAFE' : i % 2 === 0 ? 'white' : '#FAFBFC',
                    cursor:    isGridEditing ? 'default' : 'pointer',
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
                      style={{ padding: '9px 16px', whiteSpace: 'nowrap', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#374151' }}
                      // Prevents the row-click selection handler from firing
                      // when the user clicks inside an editable input.
                      onClick={(e) => { if (isRowEditing) e.stopPropagation() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })
          )}

          {/* Inline add row */}
          {/* Shown at the bottom of the table when the user clicks "Add". */}
          {isAdding && (
            <tr style={{ backgroundColor: '#EFF6FF', borderLeft: '3px solid #2563EB' }}>
              <td style={{ padding: '8px 16px' }} />
              {colDefs.map((col) => (
                <td key={col.key} style={{ padding: '8px 16px' }}>
                  {col.readOnly ? (
                    // Auto-generated fields (e.g. CI ID) show a placeholder instead of an input.
                    <Text size="xs" c="dimmed" fs="italic">Auto</Text>
                  ) : (() => {
                    const val = (newForm as Indexable<P>)[col.key]

                    // Module pages can override specific add-row cells.
                    if (cellOverride) {
                      const formSnap = newFormRef.current as Partial<T & P>
                      const setField = (key: string, value: unknown) => setNewField(key, value)
                      const override = cellOverride(col, '__new__', val, formSnap, setField, onEnter)
                      if (override != null) return override
                    }

                    if (TEXT_DATE_FIELDS.has(col.key)) {
                      return (
                        <TextDateCell
                          value={val}
                          field={col.key}
                          width={col.width}
                          disabled={col.disabled}
                          onChange={(f, v) => setNewField(f, v)}
                          onEnter={onEnter}
                        />
                      )
                    }

                    return (
                      <EditableCell
                        value={val}
                        field={col.key}
                        type={resolveInputType(col.key, col.type)}
                        options={col.type === 'boolean' ? ['Yes', 'No'] : col.options}
                        isEditing
                        onChange={(f, v) => setNewField(f, v)}
                        onBlur={col.onBlur
                          ? (value) => col.onBlur!(value, newFormRef.current as Partial<T>, (updater) => {
                              const next = typeof updater === 'function'
                                ? (updater as (prev: Partial<T>) => Partial<T>)(newFormRef.current as Partial<T>)
                                : updater
                              setNewForm((prev) => ({ ...prev, ...next } as P))
                            })
                          : undefined
                        }
                        booleanFields={booleanFields}
                        width={col.width}
                        disabled={col.disabled}
                        onEnter={onEnter}
                        placeholder={col.placeholder}
                      />
                    )
                  })()}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </ScrollArea>
  )

  // Render

  return (
    <>
      {toolbar}

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
        renderTableContent()
      )}

      {/* Pagination - only shown when there are more records than the current page size. */}
      {total > 15 && (
        <Group justify="center" mt="md" align="center">
          <Select
            value={String(perPage)}
            onChange={(v) => { onPerPageChange(Number(v ?? 15)) }}
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
            <Pagination value={page} onChange={onPageChange} total={lastPage} color="#5375BF" size="sm" />
          )}
        </Group>
      )}
    </>
  )
}