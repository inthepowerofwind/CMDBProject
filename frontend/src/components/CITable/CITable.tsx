// The main reusable table component for all CI modules.

// Responsibilities:
//   - Fetching and paginating records from the backend
//   - Managing search, filter, and sort state
//   - Inline add row (with validation)
//   - Grid edit mode (multi-row editing with save/cancel)
//   - Row selection, deletion, and archive/restore
//   - Rendering the delete and restore confirmation modals

// The actual table UI (headers, rows, toolbar, pagination) lives in TableView.tsx.
// Date utilities live in dateHelpers.ts.
// Shared badge/color constants live in src/utils/ciTableHelpers.tsx.

import { useState, useEffect, useCallback, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import {
  Box, Button, TextInput, Select, Group, Text,
  Modal, Stack,
} from '@mantine/core'
import {
  IconPlus, IconTrash, IconEdit, IconDeviceFloppy,
  IconX, IconArchive, IconArchiveOff, IconArrowLeft,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { SortingState } from '@tanstack/react-table'

import { TableView } from './TableView'
import { CITableProps, Indexable } from './CITable.types'

// Constants

// Default number of records shown per page.
// The pagination control only appears when total > 15,
const DEFAULT_PER_PAGE = 15

// Component

export default function CITable<T extends object, P extends object>({
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

  // View state
  const [isArchiveView, setIsArchiveView] = useState(false)
  const [perPage, setPerPage]             = useState(DEFAULT_PER_PAGE)

  // Main table data
  const [rows, setRows]                 = useState<T[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [lastPage, setLastPage]         = useState(1)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sorting, setSorting]           = useState<SortingState>([])

  // Archive table data
  // Only fetched when the user opens the archive view.
  const [archiveRows, setArchiveRows]         = useState<T[]>([])
  const [archiveTotal, setArchiveTotal]       = useState(0)
  const [archivePage, setArchivePage]         = useState(1)
  const [archiveLastPage, setArchiveLastPage] = useState(1)
  const [archiveLoading, setArchiveLoading]   = useState(false)
  const [archiveError, setArchiveError]       = useState('')
  const [archiveSearch, setArchiveSearch]     = useState('')

  // Row selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Inline add row
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm]   = useState<P>(emptyForm())
  const [saving, setSaving]     = useState(false)

  // Grid edit
  const [isGridEditing, setIsGridEditing] = useState(false)
  const [editableIds, setEditableIds]     = useState<Set<string>>(new Set())
  const [editSaving, setEditSaving]       = useState(false)

  // Holds the live draft form values for every row currently being edited.
  // setEditForms is called only when a re-render is explicitly needed.
  const editFormsRef = useRef<Record<string, Partial<P>>>({})
  const [_editForms, setEditForms] = useState<Record<string, Partial<P>>>({}) // render trigger only

  // Mirrors newForm for synchronous reads inside callbacks.
  const newFormRef = useRef<P>(emptyForm())
  useEffect(() => { newFormRef.current = newForm }, [newForm])
  // Modals
  const [deleteModalOpen, setDeleteModalOpen]   = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)

  // Sort params
  const sortBy  = sorting[0]?.id
  const sortDir = sortBy ? (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc' : undefined

  // Data fetching
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

  // Fetches archived records. Only runs if the module supports restore (soft-delete).
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

  // Clear selection whenever the view, page, or filters change.
  useEffect(() => {
    setSelectedIds(new Set())
  }, [page, search, filterStatus, isArchiveView, archivePage, archiveSearch])

  // Form field updaters

  // Updates a field in the inline add form.
  const setNewField = (key: string, value: unknown) => {
    const col     = colDefs.find((c) => c.key === key)
    const coerced = col?.type === 'number'
      ? (value === '' || value === null || value === undefined ? null : Number(value))
      : (value === '' ? null : value)
    setNewForm((f) => ({ ...f, [key]: coerced } as P))
  }

  // Updates a field in the edit form for a specific row via ref.
  const setGridField = (ciId: string, key: string, value: unknown, rerender = false) => {
    const col     = colDefs.find((c) => c.key === key)
    const coerced = col?.type === 'number'
      ? (value === '' || value === null || value === undefined ? null : Number(value))
      : value
    editFormsRef.current = {
      ...editFormsRef.current,
      [ciId]: { ...editFormsRef.current[ciId], [key]: coerced },
    }
    if (rerender) setEditForms({ ...editFormsRef.current })
  }

  // Add

  // Validates required fields then submits the new row to the backend.
  const handleAdd = async () => {

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

      // Navigate to the last page so the new record is immediately visible.
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

  // Grid edit

  // Enters grid edit mode for selected rows (or all rows if nothing is selected).
  // Pre-populates each row's edit form with its current data as the starting draft.
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

  // Validates then saves all edited rows to the backend in parallel.
  const handleSaveEdit = async () => {
  
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
          current[String((r as Indexable<T>)[idField])] as P,
        ))
      )
      // Merge updated rows back into local state to avoid a full re-fetch.
      setRows((prev) =>
        prev.map((r) =>
          results.find((u) =>
            String((u as Indexable<T>)[idField]) === String((r as Indexable<T>)[idField])
          ) ?? r
        )
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

  // Exits grid edit mode and discards all unsaved changes.
  const handleCancelEdit = () => {
    setIsGridEditing(false)
    setEditableIds(new Set())
    editFormsRef.current = {}
    setEditForms({})
  }

  // Delete

  // Deletes all selected rows after confirmation. Adjusts the page if it becomes empty.
  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => service.delete(id)))
      setSelectedIds(new Set())
      notifications.show({ color: 'orange', message: `${ids.length} item(s) moved to Archive.` })

      const newTotal    = total - ids.length
      const newLastPage = Math.max(1, Math.ceil(newTotal / (perPage === 0 ? 99999 : perPage)))
      const targetPage  = Math.min(page, newLastPage)

      if (targetPage !== page) {
        setPage(targetPage)
      } else {
        fetchRows()
      }
    } catch {
      notifications.show({ color: 'red', message: 'Failed to delete.' })
    }
  }

  // Restore

  // Restores selected archived rows. Refreshes both tables so counts stay in sync.
  const handleRestoreSelected = async () => {
    if (!service.restore) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => service.restore!(id)))
      setSelectedIds(new Set())
      notifications.show({ color: 'green', message: `${ids.length} item(s) restored.` })
    
      fetchArchiveRows()
      fetchRows()
    } catch {
      notifications.show({ color: 'red', message: 'Failed to restore.' })
    }
  }

  // Row selection

  const currentRows = isArchiveView ? archiveRows : rows

  // Toggles selection for a single row. Does nothing during grid edit mode.
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

  // Toggles between selecting all visible rows and deselecting all records.
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentRows.map((r) => String((r as Indexable<T>)[idField]))))
    }
  }

  const hasSelection = selectedIds.size > 0
  // True if the service supports soft delete (archive + restore).
  const hasArchive   = !!service.restore

  // Toolbars

  // Main table toolbar: search input, status filter, total count,
  // and action buttons that change based on current mode
  // (default / adding a record / grid editing).
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
          // Grid edit mode buttons
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
          // Inline add row buttons
          <>
            <Button size="sm" variant="subtle" color="gray" onClick={() => { setIsAdding(false); setNewForm(emptyForm()) }}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={handleAdd}
              loading={saving}
              // Disabled until all required fields have a value.
              disabled={requiredFields.some((f) => !(newForm as Record<string, unknown>)[f])}
              style={{ backgroundColor: '#2563EB' }}
            >
              Save
            </Button>
          </>
        ) : (
          // Default mode buttons
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

  // Archive view toolbar: back button, search, total count, and restore button.
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
            <Button size="sm" variant="light" color="green" leftSection={<IconArchiveOff size={14} />} onClick={() => setRestoreModalOpen(true)}>
              Restore ({selectedIds.size})
            </Button>
          </>
        )}
      </Group>
    </Group>
  )

  // Render

  // Shared props passed to both the main and archive TableView instances.
  const sharedTableProps = {
    idField, colDefs, addLabel, booleanFields,
    selectedIds, allSelected, someSelected,
    onSelectAll: handleSelectAll,
    onRowClick:  handleRowClick,
    editFormsRef,
    setGridField,
    newForm, setNewField, setNewForm, newFormRef,
    tableMinWidth: 900,
    cellOverride,
    sorting,
    onSortingChange: setSorting,
    perPage,
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
          <Box style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#FFF1F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <Button variant="default" size="sm" style={{ flex: 1 }} onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red"     size="sm" style={{ flex: 1 }} onClick={handleDeleteConfirm}>Yes, Delete</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Restore confirmation modal */}
      <Modal
        opened={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        withCloseButton={false}
        centered size="sm" radius="md"
        overlayProps={{ blur: 2, backgroundOpacity: 0.35 }}
      >
        <Stack align="center" gap="md">
          <Box style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F0FFF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconArchiveOff size={26} color="#2F9E44" />
          </Box>

          <Stack align="center" gap={4}>
            <Text fw={700} size="md" c="#0F172A">Confirm Restore</Text>
            <Text size="sm" c="dimmed" ta="center">
              Are you sure you want to restore <strong>{selectedIds.size} item(s)</strong>?
              They will be moved back to the main table.
            </Text>
          </Stack>

          <Group justify="center" gap="sm" w="100%" mt={4}>
            <Button variant="default" size="sm" style={{ flex: 1 }} onClick={() => setRestoreModalOpen(false)}>Cancel</Button>
            <Button color="green"    size="sm" style={{ flex: 1 }} onClick={() => { setRestoreModalOpen(false); handleRestoreSelected() }}>Yes, Restore</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Archive view */}
      {/* Read-only table showing soft-deleted records with a restore option. */}
      {isArchiveView ? (
        <TableView<T, P>
          {...sharedTableProps}
          rows=           {archiveRows}
          total=          {archiveTotal}
          page=           {archivePage}
          lastPage=       {archiveLastPage}
          loading=        {archiveLoading}
          error=          {archiveError}
          isArchiveView
          isGridEditing=  {false}
          editableIds=    {new Set()}
          isAdding=       {false}
          onPageChange=   {setArchivePage}
          toolbar=        {archiveToolbar}
          onEnter=        {undefined}
          onPerPageChange={(v) => { setPerPage(v); setArchivePage(1) }}
        />
      ) : (
        // Main view
        // Full table with add, edit, delete, and archive actions.
        <TableView<T, P>
          {...sharedTableProps}
          rows=           {rows}
          total=          {total}
          page=           {page}
          lastPage=       {lastPage}
          loading=        {loading}
          error=          {error}

          isArchiveView=  {false}

          isGridEditing=  {isGridEditing}
          editableIds=    {editableIds}

          isAdding=       {isAdding}

          onPageChange=   {setPage}
          toolbar=        {mainToolbar}
          onEnter=        {isAdding ? handleAdd : isGridEditing ? handleSaveEdit : undefined}
          onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        />
      )}
    </Box>
  )
}