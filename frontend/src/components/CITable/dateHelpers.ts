// Date-related constants and formatting utilities used by CITable, TableView,
// and TextDateCell. Extracted here so each component doesn't need to redefine them.

// Field sets

// Column keys that store actual ISO date values (YYYY-MM-DD).
// These are rendered as MM/DD/YYYY and use a native date picker input.
export const DATE_FIELDS = new Set([
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

// Column keys that accept either a date (via picker) or free text.
// Examples: EOL Date, License Expiry - can be text or date
// These use TextDateCell instead of a plain date input.
export const TEXT_DATE_FIELDS = new Set([
  'eol_date',
  'license_expiry',
])

// Date Formatters

// Formats an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) to MM/DD/YYYY.
// Returns a dash if the value is empty or not a recognized date format.
export const formatDate = (v: unknown): string => {
  if (!v) return '—'
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.split('T')[0].split('-')
    return `${m}/${d}/${y}`
  }
  return s
}

// Converts a YYYY-MM-DD string to MM/DD/YYYY for display inside inputs.
// Returns the original string as-is if it doesn't match the expected format.
export const isoToDisplay = (iso: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${m}/${d}/${y}`
}