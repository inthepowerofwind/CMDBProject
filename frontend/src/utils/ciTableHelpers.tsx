// Shared constants and helpers used across all CI Table modules.
// Centralizing these here to prevent duplication and for easer maintenance.

import { Badge } from '@mantine/core'

// Status

export const STATUS_COLOR: Record<string, string> = {
  Active:           'green',
  Decommissioned:   'gray',
  EOL:              'red',
  'In Procurement': 'orange',
  'In Deployment':  'blue',
  Maintenance:      'yellow',
}

export const STATUS_OPTIONS = [
  'Active',
  'Decommissioned',
  'EOL',
  'In Procurement',
  'In Deployment',
  'Maintenance',
]

// Criticality

export const CRIT_COLOR: Record<string, string> = {
  Critical: 'red',
  High:     'orange',
  Medium:   'yellow',
  Low:      'blue',
}

// Badge renderer 
// Returns a colored Mantine Badge for a given color map and cell value.
// Usage: render: badge(STATUS_COLOR)  or  render: badge(CRIT_COLOR)

export const badge =
  (colorMap: Record<string, string>) =>
  (value: unknown) =>
    value ? (
      <Badge
        color={colorMap[value as string] ?? 'gray'}
        variant="light"
        size="sm"
        style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}
      >
        {value as string}
      </Badge>
    ) : null