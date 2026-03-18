import { Box, Text, ActionIcon } from '@mantine/core'
import { IconMenu2, IconBell } from '@tabler/icons-react'

interface HeaderProps {
  activePage: string
  onToggleSidebar: () => void
}

const pageTitles: Record<string, string> = {
  dashboard:     'Dashboard',
  servers:       'Servers',
  network:       'Network',
  endpoints:     'Endpoints',
  software:      'Software',
  cloudservices: 'Cloud Services',
  databases:     'Databases',
  relationships: 'Relationships',
  changelog:     'Change Log',
  reference:     'Reference',
}

export default function Header({ activePage, onToggleSidebar }: HeaderProps) {
  return (
    <Box
      style={{
        height: 58,
        borderBottom: '1px solid #E3E8EF',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        backgroundColor: 'white',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <ActionIcon
        variant="subtle"
        color="gray"
        size="md"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <IconMenu2 size={17} />
      </ActionIcon>

      <Text fw={700} size="lg" c="#0F172A">
        {pageTitles[activePage] ?? activePage}
      </Text>

      <Box style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ActionIcon variant="subtle" color="gray" size="md">
          <IconBell size={17} />
        </ActionIcon>

        <Box style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: '#DEE9FC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Text size="xs" fw={700} c="#5375BF">CM</Text>
        </Box>

        <Box>
          <Text size="sm" fw={600} c="#0F172A" style={{ lineHeight: 1.2 }}>Carlos M.</Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>Admin</Text>
        </Box>
      </Box>
    </Box>
  )
}