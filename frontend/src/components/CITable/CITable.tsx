import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import {
  Box, Text, ScrollArea, Button, Loader,
  TextInput, Select, Group, Alert, Tooltip,
  Checkbox, Pagination, Modal,
  Stack, ActionIcon,
} from '@mantine/core'
import {
  IconPlus, IconTrash, IconEdit, IconDeviceFloppy, IconAlertCircle,
  IconX, IconArchive, IconArchiveOff, IconArrowLeft,
  IconAlertTriangle, IconCalendar,
} from '@tabler/icons-react'
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
import { CITableProps, CIColumnDef } from './CITable.types'

const DEFAULT_PER_PAGE = 15

// fields that store actual Date objects - formatted as MM/DD/YYYY on display
const DATE_FIELDS = new Set([
  'purchase_date',
  'warranty_expiry',
  'last_config_review',
  'last_backup',
  'last_review',
  'last_login',
  'contract_expiry',
  'procurement_date',
  'change_date',
  'last_security_review',
])

// fields that accepts both text and date
const TEXT_DATE_FIELDS = new Set([
  'eol_date',
  'license_expiry',
])

// formats ISO date strings to MM/DD/YYYY; returns a dash if empty
const formatDate = (v: unknown): string => {
  if (!v) return '—'
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.split('T')[0].split('-')
    return `${m}/${d}/${y}`
  }
  return s
}

// converts YYYY-MM-DD to MM/DD/YYYY for display
const isoToDisplay = (iso: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${m}/${d}/${y}`
}

// lets us access typed row objects with a dynamic string key
type Indexable<T> = T & { [key: string]: unknown }

interface TextDateCellProps {
  value: unknown
  field: string
  width?: number
  disabled?: boolean
  onChange: (field: string, value: unknown, rerender?: boolean) => void
  onEnter?: () => void
}

// input cell for TEXT_DATE_FIELDS - accepts text or a date picker
// used for fields like eol date and license expiry
function TextDateCell({ value, field, width, disabled, onChange, onEnter }: TextDateCellProps) {
  const stripTime = (v: unknown): string => {
    if (!v) return ''
    const s = String(v)
    return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.split('T')[0] : s
  }

  const [localValue, setLocalValue] = useState(stripTime(value))

  useEffect(() => {
    setLocalValue(String(value ?? ''))
  }, [value])

  const applyDate = (raw: string) => {
    const picked = raw ? isoToDisplay(raw) : ''
    setLocalValue(picked)
    onChange(field, picked, true)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange(field, '', true)
  }

  const dateInputRef = useRef<HTMLInputElement>(null)

  // attaches a native input listener to the hidden date picker so it can be
  // re-opened even if the same date is picked again (resets value after each pick)
  useEffect(() => {
    const el = dateInputRef.current
    if (!el) return
    const onNativeInput = (e: Event) => {
      applyDate((e.target as HTMLInputElement).value)
      ;(e.target as HTMLInputElement).value = ''
    }
    el.addEventListener('input', onNativeInput)
    return () => el.removeEventListener('input', onNativeInput)
  }, [field])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextInput
      size="xs"
      value={localValue}
      disabled={disabled}
      placeholder="mm/dd/yyyy or text"
      onChange={(e) => {
        const v = e.target.value
        setLocalValue(v)
        onChange(field, v, true)
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
      rightSectionWidth={localValue ? 44 : 24}
      rightSection={
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {localValue && !disabled && (
            <ActionIcon
              size={14}
              variant="transparent"
              color="gray"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              style={{ cursor: 'pointer', minWidth: 14 }}
            >
              <IconX size={10} />
            </ActionIcon>
          )}
          {/* calendar icon with a hidden native date input behind it */}
          <div style={{ position: 'relative', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconCalendar size={13} style={{ color: '#868e96', pointerEvents: 'none' }} />
            <input
              ref={dateInputRef}
              type="date"
              disabled={disabled}
              tabIndex={-1}
              onChange={(e) => {
                applyDate(e.target.value)
                e.target.value = ''
              }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                colorScheme: 'light',
              }}
            />
          </div>
        </div>
      }
      style={{ width: width ?? 180 }}
    />
  )
}

// Table View props

interface TableViewProps<T extends object, P extends object> {
  rows: T[]
  total: number
  page: number
  lastPage: number
  loading: boolean
  error: string
  idField: keyof T & string
  colDefs: CIColumnDef<T>[]
  addLabel: string
  isArchiveView: boolean
  tableMinWidth: number

  selectedIds: Set<string>
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
  onRowClick: (id: string) => void

  isGridEditing: boolean
  editableIds: Set<string>
  editFormsRef: React.MutableRefObject<Record<string, Partial<P>>>
  booleanFields: string[]
  setGridField: (id: string, key: string, value: unknown, rerender?: boolean) => void

  isAdding: boolean
  newForm: P
  setNewField: (key: string, value: unknown) => void

  onPageChange: (p: number) => void
  toolbar: React.ReactNode

  setNewForm: React.Dispatch<React.SetStateAction<P>>
  newFormRef: React.MutableRefObject<P>

  onEnter?: () => void

  // Passed straight through from CITableProps
  cellOverride?: CITableProps<T, P>['cellOverride']

  placeholder?: string

  // Sorting table
  sorting: SortingState
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>

  perPage: number
  onPerPageChange: (value: number) => void
}

// handles all table UI - toolbar, headers, rows, inline add row, pagination
// all state and logic lives in CITable; this is just the display layer
function TableView<T extends object, P extends object>({
  rows, page, total, lastPage, loading, error,
  idField, colDefs, addLabel, isArchiveView,
  selectedIds, allSelected, someSelected, onSelectAll, onRowClick,
  isGridEditing, editableIds, editFormsRef, booleanFields, setGridField,
  isAdding, newForm, setNewField, setNewForm, tableMinWidth,
  onPageChange, toolbar, newFormRef, onEnter, cellOverride, sorting, 
  onSortingChange, perPage, onPerPageChange,
}: TableViewProps<T, P>) {
  const columnHelper = createColumnHelper<T>()

  // specifying input type
  const resolveInputType = (colKey: string, colType?: string) => {
    if (DATE_FIELDS.has(colKey)) return 'date'
    if (colType === 'number') return 'number'
    return 'text'
  }

  // builds column definitions for react-table: checkbox column + all data columns
  // cells switch between read-only and editable inputs based on grid edit state
  const columns = useMemo<ColumnDef<T, any>[]>(() => {
    const cols: ColumnDef<T, any>[] = []

    // checkbox column - hidden during grid edit mode
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

    colDefs.forEach((col) => {
      cols.push(columnHelper.accessor(
        (row) => row[col.key],
        {
          id: col.key,
          header: col.header,
          cell: ({ row }) => {
            const rowId   = String((row.original as Indexable<T>)[idField])
            const editing = isGridEditing && editableIds.has(rowId) && !col.readOnly

            // read-only display: use custom renderer if provided, otherwise format by field type
            if (!editing) {
              const raw = (row.original as Indexable<T>)[col.key]
              if (col.render) return col.render(raw, row.original)
              if (DATE_FIELDS.has(col.key)) return <Text size="sm">{formatDate(raw)}</Text>
              if (TEXT_DATE_FIELDS.has(col.key)) return <Text size="sm">{formatDate(raw)}</Text>
              if (typeof raw === 'boolean') return <Text size="sm">{raw ? 'Yes' : 'No'}</Text>
              return <Text size="sm">{(raw as string) ?? '—'}</Text>
            }

            // falls back to original row data if the edit form doesn't have the field yet
            const editForm = editFormsRef.current[rowId] as Indexable<P> | undefined
            const val = (editForm && col.key in editForm)
              ? editForm[col.key]
              : (row.original as Indexable<T>)[col.key]

            // allows parent pages to override specific cells with custom inputs during grid edit
            if (cellOverride) {
              const formSnap = editFormsRef.current[rowId] as Partial<T & P> | undefined
              const setField = (key: string, value: unknown, rerender = false) =>
                setGridField(rowId, key, value, rerender)
              const override = cellOverride(col, rowId, val, formSnap, setField, onEnter)
              if (override != null) return override
            }

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

            const opts = col.type === 'boolean' ? ['Yes', 'No'] : col.options

            return (
              <EditableCell
                value={val}
                field={col.key}
                type={resolveInputType(col.key, col.type)}
                options={opts}
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

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    state: { sorting },
  })

  // Table records/data
  const renderTableContent = () => (
    <ScrollArea scrollbarSize={8}>
      <table style={{ minWidth: tableMinWidth, width: '100%', borderCollapse: 'collapse' }}>
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
        <tbody>
          {rows.length === 0 && !isAdding ? (
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
                    cursor: isGridEditing ? 'default' : 'pointer',
                    borderLeft: isSelected ? '3px solid #2563EB' : isRowEditing ? '3px solid #93C5FD' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => { if (!isSelected && !isRowEditing) e.currentTarget.style.backgroundColor = '#F0F4FF' }}
                  onMouseLeave={(e) => { if (!isSelected && !isRowEditing) e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#FAFBFC' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ padding: '9px 16px', whiteSpace: 'nowrap', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#374151' }}
                      // prevents row click from firing when clicking inside an editable cell
                      onClick={(e) => { if (isRowEditing) e.stopPropagation() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })
          )}

          {/* inline add row - shown at the bottom when the user clicks "Add" */}
          {isAdding && (
            <tr style={{ backgroundColor: '#EFF6FF', borderLeft: '3px solid #2563EB' }}>
              <td style={{ padding: '8px 16px' }} />
              {colDefs.map((col) => (
                <td key={col.key} style={{ padding: '8px 16px' }}>
                  {col.readOnly ? (
                    // read-only fields like auto-generated IDs show a placeholder
                    <Text size="xs" c="dimmed" fs="italic">Auto</Text>
                  ) : (() => {
                    const val = (newForm as Indexable<P>)[col.key]

                    // allows parent pages to override specific cells in the add row
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
      ) : renderTableContent()}

      {/* pagination - only shows when there are more than 15 records */}
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

// main reusable table component for CI data
// handles fetching, pagination, search, filter, inline add, grid edit, delete, and archive
export default function CITable<
  T extends object,
  P extends object
>({
  idField,
  columns: colDefs,
  service,
  emptyForm,
  statusOptions = [],
  booleanFields = [],
  addLabel = 'Add Item',
  searchPlaceholder = 'Search...',
  requiredFields = [],
  requiredLabels = {},
  cellOverride,
}: CITableProps<T, P>) {

  const [isArchiveView, setIsArchiveView] = useState(false)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)

  // main table data
  const [rows, setRows]                 = useState<T[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [lastPage, setLastPage]         = useState(1)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sorting, setSorting]           = useState<SortingState>([])

  // archive table data - only loaded when the archive view is opened
  const [archiveRows, setArchiveRows]           = useState<T[]>([])
  const [archiveTotal, setArchiveTotal]         = useState(0)
  const [archivePage, setArchivePage]           = useState(1)
  const [archiveLastPage, setArchiveLastPage]   = useState(1)
  const [archiveLoading, setArchiveLoading]     = useState(false)
  const [archiveError, setArchiveError]         = useState('')
  const [archiveSearch, setArchiveSearch]       = useState('')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // inline add row state
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm]   = useState<P>(emptyForm())
  const [saving, setSaving]     = useState(false)

  // grid edit state - tracks which rows are being edited and their draft values
  const [isGridEditing, setIsGridEditing] = useState(false)
  const [editableIds, setEditableIds]     = useState<Set<string>>(new Set())
  const [_editForms, setEditForms]         = useState<Record<string, Partial<P>>>({})
  // ref mirrors editForms for synchronous reads inside event handlers without triggering re-renders
  const editFormsRef                      = useRef<Record<string, Partial<P>>>({})
  const newFormRef                        = useRef<P>(emptyForm())
  
  // keeps newFormRef in sync so callbacks always have the latest form values
  useEffect(() => { newFormRef.current = newForm }, [newForm])
  const [editSaving, setEditSaving]       = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // derived sort fields from sorting state, passed to the API
  const sortBy  = sorting[0]?.id
  const sortDir = (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc'

  // fetches the current page of rows from the backend with search, filter, and sort applied
  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await service.list({
        page, per_page: perPage === 0 ? 99999 : perPage,
        search: search || undefined,
        status: filterStatus || undefined,
        sort_by: sortBy, sort_dir: sortDir,
      })
      setRows(result.data)
      setTotal(result.total)
      setLastPage(result.last_page)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, sortBy, sortDir, perPage])

  useEffect(() => { fetchRows() }, [fetchRows])

  // fetches archived rows - only runs if the module supports restore (soft delete)
  const fetchArchiveRows = useCallback(async () => {
    if (!service.restore) return
    setArchiveLoading(true)
    setArchiveError('')
    try {
      const result = await service.list({
        page: archivePage, per_page: perPage === 0 ? 99999 : perPage,
        search: archiveSearch || undefined,
        archived: true,
      })
      setArchiveRows(result.data)
      setArchiveTotal(result.total)
      setArchiveLastPage(result.last_page)
    } catch {
      setArchiveError('Failed to load archived data.')
    } finally {
      setArchiveLoading(false)
    }
  }, [archivePage, archiveSearch, perPage])

  useEffect(() => {
    if (isArchiveView) fetchArchiveRows()
  }, [isArchiveView, fetchArchiveRows])

  // clears selection whenever the view, page, or filters change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [page, search, filterStatus, isArchiveView, archivePage, archiveSearch])

  // updates a field in the new-item form; coerces empty strings to null and handles number types
  const setNewField = (key: string, value: unknown) => {
    const col = colDefs.find((c) => c.key === key)
    const coerced = col?.type === 'number'
      ? (value === '' || value === null || value === undefined ? null : Number(value))
      : (value === '' ? null : value)
    setNewForm((f) => ({ ...f, [key]: coerced } as P))
  }

  // updates a field in the edit form for a specific row via ref;
  // optionally triggers a re-render if the cell needs to reflect the change immediately
  const setGridField = (ciId: string, key: string, value: unknown, rerender = false) => {
    const col = colDefs.find((c) => c.key === key)
    const coerced = col?.type === 'number'
      ? (value === '' || value === null || value === undefined ? null : Number(value))
      : value
    editFormsRef.current = {
      ...editFormsRef.current,
      [ciId]: { ...editFormsRef.current[ciId], [key]: coerced },
    }
    if (rerender) setEditForms({ ...editFormsRef.current })
  }

  // validates required fields then submits the new row to the backend;
  // navigates to the last page so the new record is visible after saving
  const handleAdd = async () => {
    // Validate required CI Name field before saving
    for (const f of requiredFields) {
      if (!(newForm as Record<string, unknown>)[f]) {
        const label = requiredLabels[f] ?? f
        notifications.show({ color: 'red', message: `Failed to add. ${label} is required.` })
        return
      }
    }

    setSaving(true)
    try {
      const created = await service.create(newForm)
      setNewForm(emptyForm())
      setIsAdding(false)
      notifications.show({ color: 'green', message: `${String((created as Indexable<T>)[idField])} added.` })

      // go to the last page so the newly added row is visible
      const newLastPage = Math.ceil((total + 1) / (perPage === 0 ? 99999 : perPage))
      if (newLastPage !== page) {
        setPage(newLastPage)
      } else {
        fetchRows()
      }
    } catch {
      notifications.show({ color: 'red', message: 'Failed to add.' })
    } finally {
      setSaving(false)
    }
  }

  // enters grid edit mode for selected rows (or all rows if nothing is selected);
  // pre-populates each row's edit form with its current data as the starting draft
  const handleStartEdit = () => {
    const idsToEdit = selectedIds.size > 0
      ? new Set(selectedIds)
      : new Set(rows.map((r) => String((r as Indexable<T>)[idField])))

    const initial: Record<string, Partial<P>> = {}
    rows
      .filter((r) => idsToEdit.has(String((r as Indexable<T>)[idField])))
      .forEach((r) => { initial[String((r as Indexable<T>)[idField])] = { ...r } as Partial<P> })

    editFormsRef.current = initial
    setEditForms(initial)
    setEditableIds(idsToEdit)
    setIsGridEditing(true)
    setSelectedIds(new Set())
  }

  // validates then saves all edited rows to the backend in parallel;
  // merges updated rows back into local state to avoid a full re-fetch
  const handleSaveEdit = async () => {
    // Validate required fields across all rows being edited
    for (const [_rowId, form] of Object.entries(editFormsRef.current)) {
      for (const f of requiredFields) {
        if (!(form as Record<string, unknown>)[f]) {
          const label = requiredLabels[f] ?? f
          notifications.show({ color: 'red', message: `Failed to save. ${label} is required.` })
          return
        }
      }
    }

    setEditSaving(true)
    try {
      const current = editFormsRef.current
      const updates = rows.filter((r) => current[String((r as Indexable<T>)[idField])])
      const results = await Promise.all(
        updates.map((r) => service.update(
          String((r as Indexable<T>)[idField]),
          current[String((r as Indexable<T>)[idField])] as P
        ))
      )
      setRows((prev) =>
        prev.map((r) => results.find((u) =>
          String((u as Indexable<T>)[idField]) === String((r as Indexable<T>)[idField])
        ) ?? r)
      )
      setIsGridEditing(false)
      setEditableIds(new Set())
      editFormsRef.current = {}
      setEditForms({})
      notifications.show({ color: 'green', message: 'Changes saved.' })
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save changes.' })
    } finally {
      setEditSaving(false)
    }
  }

  // exits grid edit mode and discards all unsaved changes
  const handleCancelEdit = () => {
    setIsGridEditing(false)
    setEditableIds(new Set())
    editFormsRef.current = {}
    setEditForms({})
  }

  // deletes all selected rows after confirmation; adjusts current page if it becomes empty
  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => service.delete(id)))
      setSelectedIds(new Set())
      notifications.show({ color: 'orange', message: `${ids.length} item(s) moved to Archive.` })

      // recalculate page bounds to avoid landing on an empty page after deletion
      const newTotal = total - ids.length
      const newLastPage = Math.max(1, Math.ceil(newTotal / (perPage === 0 ? 99999 : perPage)))
      const targetPage = Math.min(page, newLastPage)

      if (targetPage !== page) {
        setPage(targetPage)
      } else {
        fetchRows()
      }
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete.' })
    }
  }

  // restores selected archived rows back to the main table;
  // refreshes both tables so counts and rows stay in sync
  const handleRestoreSelected = async () => {
    if (!service.restore) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => service.restore!(id)))
      setSelectedIds(new Set())
      notifications.show({ color: 'green', message: `${ids.length} item(s) restored.` })

      // automatic fetching of records in both archive and main table
      fetchArchiveRows()
      fetchRows()
    } catch {
      notifications.show({ color: 'red', message: 'Failed to restore.' })
    }
  }

  const currentRows = isArchiveView ? archiveRows : rows

  // toggles selection for a single row; does nothing during grid edit mode
  const handleRowClick = (id: string) => {
    if (isGridEditing) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected  = currentRows.length > 0 && currentRows.every((r) => selectedIds.has(String((r as Indexable<T>)[idField])))
  const someSelected = selectedIds.size > 0 && !allSelected

  // toggles between selecting all visible rows and clearing the selection
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentRows.map((r) => String((r as Indexable<T>)[idField]))))
    }
  }

  const hasSelection = selectedIds.size > 0
  // true if the module supports soft delete (archive/restore)
  const hasArchive   = !!service.restore

  // toolbar for the main table - search, status filter, and action buttons
  // buttons change depending on the current mode: default, adding, or grid editing
  const mainToolbar = (
    <Group justify="space-between" mb="lg">
      <Group gap={8}>
        <TextInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          size="sm" style={{ width: 240 }}
        />
        {statusOptions.length > 0 && (
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPage(1) }}
            data={statusOptions}
            clearable size="sm" style={{ width: 200 }}
          />
        )}
        <Text size="sm" c="dimmed">Total: {total}</Text>
      </Group>

      <Group gap={8}>
        {isGridEditing ? (
          <>
            <Button size="sm" variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={handleSaveEdit}
              loading={editSaving}
              style={{ backgroundColor: '#2563EB' }}
            >
              Save Changes
            </Button>
          </>
        ) : isAdding ? (
          <>
            <Button size="sm" variant="subtle" color="gray" onClick={() => { setIsAdding(false); setNewForm(emptyForm()) }}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={handleAdd}
              loading={saving}
              // disabled 'Save' button until all required fields are filled
              disabled={requiredFields.some((f) => !(newForm as Record<string, unknown>)[f])}
              style={{ backgroundColor: '#2563EB' }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            {hasSelection && (
              <>
                <Button size="sm" variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={() => setSelectedIds(new Set())}>
                  Cancel
                </Button>
                <Button size="sm" variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={() => setDeleteModalOpen(true)}>
                  Delete ({selectedIds.size})
                </Button>
              </>
            )}
            <Button size="sm" variant="light" color="blue" leftSection={<IconEdit size={14} />} onClick={handleStartEdit}>
              Edit
            </Button>
            {!hasSelection && (
              <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setIsAdding(true)} style={{ backgroundColor: '#2563EB' }}>
                {addLabel}
              </Button>
            )}
            {hasArchive && (
              <Button size="sm" variant="light" color="gray" leftSection={<IconArchive size={14} />} onClick={() => { setIsArchiveView(true); setSelectedIds(new Set()) }}>
                Archive
              </Button>
            )}
          </>
        )}
      </Group>
    </Group>
  )

  // toolbar for the archive view - back button, search, and restore button
  const archiveToolbar = (
    <Group justify="space-between" mb="lg">
      <Group gap={8}>
        <Button size="sm" variant="subtle" color="gray" leftSection={<IconArrowLeft size={14} />} onClick={() => { setIsArchiveView(false); setSelectedIds(new Set()) }}>
          Back
        </Button>
        <TextInput
          placeholder={`Search archived ${addLabel?.replace('Add ', '') ?? 'items'}...`}
          value={archiveSearch}
          onChange={(e) => { setArchiveSearch(e.target.value); setArchivePage(1) }}
          size="sm" style={{ width: 240 }}
        />
        <Text size="sm" c="dimmed">Total archived: {archiveTotal}</Text>
      </Group>

      <Group gap={8}>
        {hasSelection && (
          <>
            <Button size="sm" variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={() => setSelectedIds(new Set())}>
              Cancel
            </Button>
            <Button size="sm" variant="light" color="green" leftSection={<IconArchiveOff size={14} />} onClick={handleRestoreSelected}>
              Restore ({selectedIds.size})
            </Button>
          </>
        )}
      </Group>
    </Group>
  )

  return (
    <Box p="xl">

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        withCloseButton={false}
        centered
        size="sm"
        radius="md"
        overlayProps={{ blur: 2, backgroundOpacity: 0.35 }}
      >
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: '#FFF1F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconAlertTriangle size={26} color="#E03131" />
          </Box>

          <Stack align="center" gap={4}>
            <Text fw={700} size="md" c="#0F172A">Confirm Delete</Text>
            <Text size="sm" c="dimmed" ta="center">
              Are you sure you want to delete <strong>{selectedIds.size} item(s)</strong>?
              {hasArchive && ' They will be moved to the Archive and can be restored later.'}
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

      {/* Archive view - read-only, shows soft-deleted records with a restore option */}
      {isArchiveView ? (
        <TableView<T, P>
          rows=         {archiveRows}
          total=        {archiveTotal}
          page=         {archivePage}
          lastPage=     {archiveLastPage}
          loading=      {archiveLoading}
          error=        {archiveError}
          idField=      {idField}
          colDefs=      {colDefs}
          addLabel=     {addLabel}
          isArchiveView
          selectedIds=  {selectedIds}
          allSelected=  {allSelected}
          someSelected= {someSelected}
          onSelectAll=  {handleSelectAll}
          onRowClick=   {handleRowClick}
          isGridEditing={false}
          editableIds=  {new Set()}
          editFormsRef= {editFormsRef}
          booleanFields={booleanFields}
          setGridField= {setGridField}
          isAdding=     {false}
          newForm=      {newForm}
          setNewField=  {setNewField}
          setNewForm=   {setNewForm}
          onPageChange= {setArchivePage}
          toolbar=      {archiveToolbar}
          tableMinWidth={900}
          newFormRef=   {newFormRef}
          onEnter={isAdding ? handleAdd : isGridEditing ? handleSaveEdit : undefined}
          cellOverride= {cellOverride}
          sorting=        {sorting}
          onSortingChange={setSorting}
          perPage=        {perPage}
          onPerPageChange={(v) => { setPerPage(v); setArchivePage(1) }}
        />
      ) : (
        // Main view - full table with add, edit, delete, and archive actions
        <TableView<T, P>
          rows=           {rows}
          total=          {total}
          page=           {page}
          lastPage=       {lastPage}
          loading=        {loading}
          error=          {error}
          idField=        {idField}
          colDefs=        {colDefs}
          addLabel=       {addLabel}
          isArchiveView=  {false}
          selectedIds=    {selectedIds}
          allSelected=    {allSelected}
          someSelected=   {someSelected}
          onSelectAll=    {handleSelectAll}
          onRowClick=     {handleRowClick}
          isGridEditing=  {isGridEditing}
          editableIds=    {editableIds}
          editFormsRef=   {editFormsRef}
          booleanFields=  {booleanFields}
          setGridField=   {setGridField}
          isAdding=       {isAdding}
          newForm=        {newForm}
          setNewField=    {setNewField}
          setNewForm=     {setNewForm}
          onPageChange=   {setPage}
          toolbar=        {mainToolbar}
          tableMinWidth=  {900}
          newFormRef=     {newFormRef}
          onEnter={isAdding ? handleAdd : isGridEditing ? handleSaveEdit : undefined}
          cellOverride=   {cellOverride}
          sorting=        {sorting}
          onSortingChange={setSorting}
          perPage=        {perPage}
          onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        />
      )}
    </Box>
  )
}