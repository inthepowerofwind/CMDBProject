import { Grid, Card, Text, Group, Box, ThemeIcon, Table, TableData, Alert, Loader, Badge, Stack, Anchor } from '@mantine/core'
import { IconServer, IconCircleCheck, IconCircleX, IconAlertTriangle, IconAlertCircle, IconArchive, IconArrowBarToRight } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ComponentType, useEffect, useState } from 'react'
import { dashboardService, DashboardData } from '../api/dashboardService'
import { changeLogService, ChangeLog as ChangeLogEntry } from '../api/changeLogService'

interface StatCardProps {
  title: string
  value: number
  color: string
  iconColor?: string
  icon: ComponentType<{ size?: number }>
}

interface DashboardProps {
  onNavigate: (page: string) => void
}

const CHANGE_TYPE_COLOR: Record<string, string> = {
  'Created':               'green',
  'Deleted':               'red',
  'Restored':              'yellow',
  'Updated':               'blue',
  'Status Change':         'blue',
  'Patch Update':          'cyan',
  'OS Update':             'cyan',
  'Firmware Update':       'cyan',
  'Version Update':        'cyan',
  'Ownership Change':      'blue',
  'Location Change':       'blue',
  'Environment Change':    'blue',
  'Criticality Change':    'violet',
  'Classification Change': 'grape',
  'Tier Change':           'violet',
  'Cost Update':           'yellow',
  'License Update':        'yellow',
  'Compliance Update':     'yellow',
  'SLA Update':            'yellow',
  'Rename':                'gray',
}

const tableData: TableData = {
  body: [
    ['Organization',        'Sample Organization Inc.'],
    ['CMDB Version',        '1.0'],
    ['Effective Date',      '2026-01-01'],
    ['Last Reviewed',       '2026-03-01'],
    ['CMDB Owner',          'IT Asset Manager'],
    ['Policy Reference',    '7.2.1 Asset Management | 7.2.2 Configuration Management'],
    ['Framework Alignment', 'ISO 27001:2022 A.5.9, A.5.10 | ITIL 4 — Configuration Management Practice'],
  ],
}

const tableWorkbook: TableData = {
  head: [['Sheet'], ['Contents'], ['CI Types Covered']],
  body: [
    ['Servers',        'Physical and virtual servers',              'File Server, Domain Controller, App Server, Web Server, VM Host'],
    ['Network',        'Network infrastructure devices',            'Core Switch, Firewall, Router, Wireless AP, Load Balancer'],
    ['Endpoints',      'User endpoint devices',                     'Laptop, Desktop, Mobile Phone, Tablet'],
    ['Software',       'Software license and application records',  'OS, Office Suite, Security Tools, Business Applications'],
    ['Cloud Services', 'Cloud service and SaaS records',            'IaaS, PaaS, SaaS platforms'],
    ['Databases',      'Database instances',                        'SQL Server, Oracle, MySQL, PostgreSQL'],
    ['Relationships',  'CI dependency and relationship map',        'All CI-to-CI and CI-to-Service relationships'],
    ['Change Log',     'Change history for all CIs',                'All changes, versions, and configuration updates'],
    ['Reference',      'Lookup tables and classification codes',    'Status, Category, Criticality, Environment values'],
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

function ChangeRow({ log }: { log: ChangeLogEntry }) {
  return (
    <Box
      style={{
        background: '#F8FAFC',
        border: '1px solid #e9ecef',
        borderRadius: 10,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
      }}
    >
      <Group gap={14} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <Text
          fw={600}
          size="sm"
          style={{
            whiteSpace: 'nowrap',
            minWidth: 68,
            color: '#1a2b4a',
            alignSelf: 'flex-start',
            paddingTop: 1,
          }}
        >
          {log.ci_id}
        </Text>

        <Box style={{ minWidth: 0 }}>
          <Text size="sm" fw={500} style={{ color: '#1a2b4a' }} truncate>
            {log.change_description ?? `${log.change_type} on ${log.ci_name}`}
          </Text>
          <Text
            size="xs"
            c="dimmed"
            mt={2}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {log.change_log_id} &bull; {log.change_by}
          </Text>
        </Box>
      </Group>

      <Badge
        color={CHANGE_TYPE_COLOR[log.change_type] ?? 'gray'}
        variant="light"
        size="sm"
        radius="md"
        style={{ whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600, minWidth: 90, minHeight: 30, textAlign: 'center' }}
      >
        {log.change_type}
      </Badge>
    </Box>
  )
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [dashData, setDashData]       = useState<DashboardData | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const [dashError, setDashError]     = useState('')

  const [changeLogs, setChangeLogs]   = useState<ChangeLogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [logsError, setLogsError]     = useState('')

  useEffect(() => {
    dashboardService.get()
      .then((data) => setDashData(data))
      .catch(() => setDashError('Failed to load dashboard data.'))
      .finally(() => setDashLoading(false))
  }, [])

  useEffect(() => {
    changeLogService.list({ page: 1, per_page: 5, sort_by: 'created_at', sort_dir: 'desc' })
      .then((result) => setChangeLogs(result.data))
      .catch(() => setLogsError('Failed to load change logs.'))
      .finally(() => setLogsLoading(false))
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

  const totalCIs      = dashData.total_cis
  const totalActive   = dashData.ci_per_status.find((s) => s.label === 'Active')?.total ?? 0
  const totalDecomm   = dashData.ci_per_status.find((s) => s.label === 'Decommissioned')?.total ?? 0
  const totalEol      = dashData.ci_per_status.find((s) => s.label === 'EOL')?.total ?? 0
  const totalArchived = dashData.ci_per_status.find((s) => s.label === 'Archived')?.total ?? 0

  return (
    <Box p="xl" mt="xl">
      <Group grow mb="xl">
        <StatCard title="Total CIs"      value={totalCIs}      color="black" iconColor="blue"   icon={IconServer} />
        <StatCard title="Active"         value={totalActive}   color="black" iconColor="green"  icon={IconCircleCheck} />
        <StatCard title="Decommissioned" value={totalDecomm}   color="black" iconColor="gray"   icon={IconCircleX} />
        <StatCard title="EOL / At Risk"  value={totalEol}      color="black" iconColor="red"    icon={IconAlertTriangle} />
        <StatCard title="Archive"       value={totalArchived}  color="black" iconColor="yellow" icon={IconArchive} />
      </Group>

      <Grid mt="lg">
        <Grid.Col span={7}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Text fw={600} mb={4} c="#1a2b4a">CI Category Summary</Text>
            <Text size="xs" c="dimmed" mb="md">By status across all categories</Text>

            <Group mt={10} gap="lg" mb="xl">
              {[
                { label: 'Active',         color: '#40c057' },
                { label: 'Decommissioned', color: '#adb5bd' },
                { label: 'EOL / At Risk',  color: '#e53e3e' },
              ].map(({ label, color }) => (
                <Group key={label} gap={6}>
                  <Box style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">{label}</Text>
                </Group>
              ))}
            </Group>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dashData.ci_per_category} margin={{ left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '0.5px solid rgba(0,0,0,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="active"         name="Active"         fill="#40c057" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decommissioned" name="Decommissioned" fill="#adb5bd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eol"            name="EOL / At Risk"  fill="#e53e3e" radius={[4, 4, 0, 0]} />
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
          <Card shadow="sm" radius="md" withBorder mt="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600} c="#1a2b4a" size="md">Recent Changes</Text>
              <Anchor
                component="button"
                size="xs"
                c="dimmed"
                onClick={() => onNavigate('changelog')}
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
              <Stack gap={8}>
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