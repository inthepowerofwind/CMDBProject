import { Grid, Card, Text, Group, Box, ThemeIcon, Table, TableData, Alert, Loader } from '@mantine/core'
import { IconServer, IconCircleCheck, IconCircleX, IconAlertTriangle, IconAlertCircle, IconArchive } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ComponentType, useEffect, useState } from 'react'
import { dashboardService, DashboardData } from '../api/dashboardService'

interface StatCardProps {
  title: string
  value: number
  color: string
  iconColor?: string
  icon: ComponentType<{ size?: number }>
}

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
};

const tableWorkbook: TableData = {
  head: [
    ['Sheet'],
    ['Contents'], 
    ['CI Types Covered']
  ],
  
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
};

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

export default function Dashboard() {
  const [dashData, setDashData] = useState<DashboardData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  
  useEffect(() => {
    dashboardService.get()
      .then((data) => setDashData(data))  
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false)) 
  }, [])  

  if (loading) {
    return (
      <Box p="xl" style={{ display:'flex', justifyContent:'center', paddingTop: 80 }}>
        <Loader color="#5375BF" />
      </Box>
    )
  }

  if (error || !dashData) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error || 'No data available.'}
        </Alert>
      </Box>
    )
  }

  const totalCIs = dashData.total_cis
  const totalActive = dashData.ci_per_status.find((s) => s.label === 'Active')?.total ?? 0
  const totalDecomm = dashData.ci_per_status.find((s) => s.label === 'Decommissioned')?.total ?? 0
  const totalEol = dashData.ci_per_status.find((s) => s.label === 'EOL')?.total ?? 0
  const totalArchived = dashData.ci_per_status.find((s) => s.label === 'Archived')?.total ?? 0

  return (
    <Box p="xl" mt="xl">
      <Group grow mb="xl">
        <StatCard title="Total CIs"      value={totalCIs}   color="black" iconColor="blue"   icon={IconServer} />
        <StatCard title="Active"         value={totalActive} color="black" iconColor="green" icon={IconCircleCheck} />
        <StatCard title="Decommissioned" value={totalDecomm} color="black" iconColor="gray"  icon={IconCircleX} />
        <StatCard title="EOL / At Risk"  value={totalEol}    color="black" iconColor="red"   icon={IconAlertTriangle} />
        <StatCard title="Archived"       value={totalArchived} color="black" iconColor="yellow" icon={IconArchive} />
      </Group>

      <Grid mt="lg">
        <Grid.Col span={7}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Text fw={600} mb="md" c="#1a2b4a">CI Category Summary</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashData.ci_per_category}
                margin={{ left: -20, bottom: 5 }}
              >
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
              <Table striped highlightOnHover withTableBorder withColumnBorders data={tableData}/>
            </Table.ScrollContainer>
          </Card>

          <Card shadow="sm" radius="md" withBorder h="230">
            <Text fw={600} mb="md" c="#1a2b4a">Workbook Navigation</Text>
            <Table.ScrollContainer minWidth={500} maxHeight={300}>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={tableWorkbook}/>
            </Table.ScrollContainer>
          </Card>
        </Grid.Col>
      </Grid>  
    </Box>
  )
}
