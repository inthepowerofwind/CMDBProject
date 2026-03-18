import { Grid, Card, Text, Group, Box, Table, Badge, ThemeIcon, RingProgress, Stack } from '@mantine/core'
import { IconServer, IconCircleCheck, IconCircleX, IconAlertTriangle } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ComponentType } from 'react'
import { ciSummary } from '../data/mockData'

interface StatCardProps {
  title: string
  value: number
  color: string
  icon: ComponentType<{ size?: number }>
}

function StatCard({ title, value, color, icon: Icon }: StatCardProps) {
  return (
    <Card shadow="sm" radius="md" withBorder>
      <Group justify="space-between">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>{title}</Text>
          <Text size="28px" fw={700} c={color}>{value}</Text>
        </Box>
        <ThemeIcon size="xl" radius="md" color={color} variant="light">
          <Icon size={22} />
        </ThemeIcon>
      </Group>
    </Card>
  )
}

export default function Dashboard() {
  const totalCIs    = ciSummary.reduce((sum, r) => sum + r.total, 0)
  const totalActive = ciSummary.reduce((sum, r) => sum + r.active, 0)
  const totalDecomm = ciSummary.reduce((sum, r) => sum + r.decommissioned, 0)
  const totalEol    = ciSummary.reduce((sum, r) => sum + r.eolAtRisk, 0)

  return (
    <Box p="xl">
      <Grid mb="xl">
        <Grid.Col span={3}>
          <StatCard title="Total CIs"      value={totalCIs}    color="blue"  icon={IconServer}        />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatCard title="Active"         value={totalActive} color="green" icon={IconCircleCheck}   />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatCard title="Decommissioned" value={totalDecomm} color="gray"  icon={IconCircleX}       />
        </Grid.Col>
        <Grid.Col span={3}>
          <StatCard title="EOL / At Risk"  value={totalEol}    color="red"   icon={IconAlertTriangle} />
        </Grid.Col>
      </Grid>

      <Grid mb="xl">
        <Grid.Col span={7}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Text fw={600} mb="md" c="#1a2b4a">CI Inventory by Category</Text>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ciSummary} margin={{ left: -20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active"         name="Active"         fill="#2e6fdb" radius={[4,4,0,0]} />
                <Bar dataKey="decommissioned" name="Decommissioned" fill="#a0aec0" radius={[4,4,0,0]} />
                <Bar dataKey="eolAtRisk"      name="EOL / At Risk"  fill="#e53e3e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={5}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Text fw={600} mb="md" c="#1a2b4a">Health Overview</Text>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <RingProgress
                size={180} thickness={20}
                label={
                  <Text ta="center" fw={700} size="xl">
                    {Math.round((totalActive / totalCIs) * 100)}%
                    <Text size="xs" c="dimmed" fw={400}>Active</Text>
                  </Text>
                }
                sections={[
                  { value: (totalActive / totalCIs) * 100, color: 'green' },
                  { value: (totalDecomm / totalCIs) * 100, color: 'gray'  },
                  { value: (totalEol    / totalCIs) * 100, color: 'red'   },
                ]}
              />
            </Box>
            <Stack gap="xs" mt="md">
              {[
                { label: 'Active',         value: totalActive, color: '#40c057' },
                { label: 'Decommissioned', value: totalDecomm, color: '#adb5bd' },
                { label: 'EOL / At Risk',  value: totalEol,    color: '#e53e3e' },
              ].map(item => (
                <Group key={item.label} justify="space-between" px="xs">
                  <Group gap="xs">
                    <Box w={10} h={10} style={{ borderRadius: 2, backgroundColor: item.color }} />
                    <Text size="sm" c="dimmed">{item.label}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{item.value}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" radius="md" withBorder>
        <Text fw={600} mb="md" c="#1a2b4a">CI Category Summary</Text>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead style={{ backgroundColor: '#1a2b4a' }}>
            <Table.Tr>
              {['CI Category', 'Total CIs', 'Active', 'Decommissioned', 'EOL / At Risk'].map(h => (
                <Table.Th key={h} style={{ color: 'white', fontWeight: 600 }}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ciSummary.map((row) => (
              <Table.Tr key={row.category}>
                <Table.Td fw={500}>{row.category}</Table.Td>
                <Table.Td>{row.total}</Table.Td>
                <Table.Td><Badge color="green" variant="light">{row.active}</Badge></Table.Td>
                <Table.Td><Badge color="gray"  variant="light">{row.decommissioned}</Badge></Table.Td>
                <Table.Td><Badge color="red"   variant="light">{row.eolAtRisk}</Badge></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Box>
  )
}