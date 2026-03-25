import { Grid, Card, Text, Group, Box, ThemeIcon, Table, TableData, Alert, Loader, Badge, Stack, Anchor } from '@mantine/core'
import { IconServer, IconCircleCheck, IconCircleX, IconAlertTriangle, IconAlertCircle, IconArchive, IconArrowBarToRight } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ComponentType, useEffect, useState } from 'react'
import { dashboardService, DashboardData } from '../api/dashboardService'
// import { changeLogService } from '../api/changeLogService' // uncomment when ready

interface StatCardProps {
  title: string
  value: number
  color: string
  iconColor?: string
  icon: ComponentType<{ size?: number }>
}

export type ChangeType = 'Created' | 'Deleted' | 'Status Change' | 'Location Change' | 'Updated'

export interface ChangeLog {
  ci_id: string
  description: string
  change_log_id: string
  changed_by: string
  change_type: ChangeType
}

const BADGE_CONFIG: Record<ChangeType, { color: string }> = {
  'Created':         { color: 'green'  },
  'Deleted':         { color: 'red'    },
  'Status Change':   { color: 'blue'   },
  'Location Change': { color: 'violet' },
  'Updated':         { color: 'orange' },
}

// Mock data (swap for changeLogService.get() when ready)
const MOCK_CHANGES: ChangeLog[] = [
  { ci_id: 'DB-002',  description: 'New CI record created in Databases',                    change_log_id: 'CHG-LOG-109', changed_by: 'Test User1', change_type: 'Created'         },
  { ci_id: 'REL-001', description: 'New CI record created in Relationships',                change_log_id: 'CHG-LOG-108', changed_by: 'Test User2', change_type: 'Created'         },
  { ci_id: 'SRV-012', description: 'Updated Status in Servers',                             change_log_id: 'CHG-LOG-107', changed_by: 'John',       change_type: 'Status Change'   },
  { ci_id: 'NET-016', description: 'CI record removed from Network Devices',                change_log_id: 'CHG-LOG-106', changed_by: 'Test User1', change_type: 'Deleted'         },
  { ci_id: 'SRV-009', description: 'Updated Storage (TB), Virtualized, Location, Rack Slot', change_log_id: 'CHG-LOG-105', changed_by: 'John',     change_type: 'Location Change' },
]

const tableData: TableData = {
  body: [
    ['Organization',        'Sample Organization Inc.'],
    ['CMDB Version',        '1.0'],
    ['Effective Date',      '2026-01-01'],
    ['Last Reviewed',       '2026-03-01'],
    ['CMDB Owner',          'IT Asset Manager'],
    ['Policy Reference',    '7.2.1 Asset Management | 7.2.2 Configuration Management'],
    ['Framework Alignment', 'ISO 27001:2022 A.5.9, A.5.10 | ITIL 4 — Configuration Management Practice']
  ],
}

const tableWorkbook: TableData = {
  head: [['Sheet'], ['Contents'], ['CI Types Covered']],
  body: [
    ['Servers',         'Physical and virtual servers',               'File Server, Domain Controller, App Server, Web Server, VM Host'],
    ['Network',         'Network infrastructure devices',             'Core Switch, Firewall, Router, Wireless AP, Load Balancer'],
    ['Endpoints',       'User endpoint devices',                      'Laptop, Desktop, Mobile Phone, Tablet'],
    ['Software',        'Software license and application records',   'OS, Office Suite, Security Tools, Business Applications'],
    ['Cloud Services',  'Cloud service and SaaS records',             'IaaS, PaaS, SaaS platforms'],
    ['Databases',       'Database instances',                         'SQL Server, Oracle, MySQL, PostgreSQL'],
    ['Relationships',   'CI dependency and relationship map',         'All CI-to-CI and CI-to-Service relationships'],
    ['Change Log',      'Change history for all CIs',                 'All changes, versions, and configuration updates'],
    ['Reference',       'Lookup tables and classification codes',     'Status, Category, Criticality, Environment values']
  ],
}

function StatCard({ title, value, color, iconColor, icon: Icon }: StatCardProps) {
  return (
    <Card shadow="sm" radius="md" withBorder h={100}>
      <Group justify="space-between">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>{title}</Text>
          <Text size="28px" fw={700} c={color}>{value}</Text>
        </Box>
        <ThemeIcon size="xl" radius="md" color={iconColor ?? color} variant="light">
          <Icon size={23} />
        </ThemeIcon>
      </Group>
    </Card>
  )
}

function ChangeRow({ log }: { log: ChangeLog }) {
  const badge = BADGE_CONFIG[log.change_type] ?? { color: 'gray' }

  return (
    <Box
      style={{
        border: '1px solid #e9ecef',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: '#fff',
      }}
    >
      <Group gap={16} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <Text fw={700} size="sm" style={{ whiteSpace: 'nowrap', minWidth: 72, color: '#1a2b4a' }}>
          {log.ci_id}
        </Text>
        <Box style={{ minWidth: 0 }}>
          <Text size="sm" fw={500} style={{ color: '#1a2b4a' }} truncate>
            {log.description}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {log.change_log_id} &bull; {log.changed_by}
          </Text>
        </Box>
      </Group>

      <Badge
        color={badge.color}
        variant="light"
        size="lg"
        radius="md"
        style={{ whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600, minWidth: 130, textAlign: 'center' }}
      >
        {log.change_type}
      </Badge>
    </Box>
  )
}

export default function Dashboard() {
  const [dashData, setDashData]   = useState<DashboardData | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const [dashError, setDashError] = useState('')

  const [changeLogs, setChangeLogs]     = useState<ChangeLog[]>([])
  const [logsLoading, setLogsLoading]   = useState(true)
  const [logsError, setLogsError]       = useState('')

  useEffect(() => {
    dashboardService.get()
      .then((data) => setDashData(data))
      .catch(() => setDashError('Failed to load dashboard data.'))
      .finally(() => setDashLoading(false))
  }, [])

  useEffect(() => {
    // ── Swap this block for your real service call
    // changeLogService.get()
    //   .then((data) => setChangeLogs(data.slice(0, 5)))
    //   .catch(() => setLogsError('Failed to load change logs.'))
    //   .finally(() => setLogsLoading(false))
    setTimeout(() => {
      setChangeLogs(MOCK_CHANGES.slice(0, 5))
      setLogsLoading(false)
    }, 500)
  }, [])

  if (dashLoading) {
    return (
      <Box p="xl" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Loader color="#5375BF" />
      </Box>
    )
  }

  if (dashError || !dashData) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {dashError || 'No data available.'}
        </Alert>
      </Box>
    )
  }

  const totalCIs    = dashData.total_cis
  const totalActive = dashData.ci_per_status.find((s) => s.label === 'Active')?.total ?? 0
  const totalDecomm = dashData.ci_per_status.find((s) => s.label === 'Decommissioned')?.total ?? 0
  const totalEol    = dashData.ci_per_status.find((s) => s.label === 'EOL')?.total ?? 0
  const totalArchive = dashData.total_archive

  return (
    <Box p="xl" mt="xl">
      <Group grow mb="xl">
        <StatCard title="Total CIs"      value={totalCIs}    color="black" iconColor="blue"   icon={IconServer} />
        <StatCard title="Active"         value={totalActive} color="black" iconColor="green"  icon={IconCircleCheck} />
        <StatCard title="Decommissioned" value={totalDecomm} color="black" iconColor="gray"   icon={IconCircleX} />
        <StatCard title="EOL / At Risk"  value={totalEol}    color="black" iconColor="red"    icon={IconAlertTriangle} />
        <StatCard title="Archive"        value={totalArchive}    color="black" iconColor="yellow" icon={IconArchive} />
      </Group>

      <Grid mt="lg">
        <Grid.Col span={7}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Text fw={600} mb="md" c="#1a2b4a">CI Category Summary</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashData.ci_per_category} margin={{ left: -20, bottom: 5 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active"         name="Active"         fill="#40c057" radius={[4,4,0,0]} />
                <Bar dataKey="decommissioned" name="Decommissioned" fill="#adb5bd" radius={[4,4,0,0]} />
                <Bar dataKey="eol"            name="EOL / At Risk"  fill="#e53e3e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={5}>
          <Card mb="lg" shadow="sm" radius="md" withBorder h="230">
            <Text fw={600} mb="md" c="#1a2b4a">CMDB Overview</Text>
            <Table.ScrollContainer minWidth={500} maxHeight={300}>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={tableData} />
            </Table.ScrollContainer>
          </Card>

          <Card shadow="sm" radius="md" withBorder h="230">
            <Text fw={600} mb="md" c="#1a2b4a">Workbook Navigation</Text>
            <Table.ScrollContainer minWidth={500} maxHeight={300}>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={tableWorkbook} />
            </Table.ScrollContainer>
          </Card>
        </Grid.Col>

        <Grid.Col>
          <Card shadow="sm" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={600} c="#1a2b4a" size="md">Recent Changes</Text>
              <Anchor
                component="button"
                size="sm"
                c="dimmed"
                onClick={() => {
                  // TODO: navigate to your Change Logs module
                  // e.g. navigate('/change-logs')
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                View All Change Logs
                <IconArrowBarToRight size={15} style={{ marginLeft: 2 }} />
              </Anchor>
            </Group>

            {logsLoading && (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <Loader color="#5375BF" size="sm" />
              </Box>
            )}

            {!logsLoading && logsError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {logsError}
              </Alert>
            )}

            {!logsLoading && !logsError && (
              <Stack gap={10}>
                {changeLogs.map((log) => (
                  <ChangeRow key={log.change_log_id} log={log} />
                ))}
              </Stack>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  )
}