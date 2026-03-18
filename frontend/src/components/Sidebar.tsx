import { Stack, Box, Text, Tooltip, UnstyledButton } from '@mantine/core'
import {
  IconDashboard, IconServer, IconNetwork,
  IconDeviceLaptop, IconApps, IconCloud,
  IconDatabase, IconArrowsLeftRight,
  IconClipboard, IconBook,
} from '@tabler/icons-react'
import { ComponentType } from 'react'

interface NavItem {
  label: string
  icon: ComponentType<{ size?: number }>
  path: string
}

interface SidebarProps {
  activePage: string
  onNavigate: (path: string) => void
  collapsed: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard',      icon: IconDashboard,       path: 'dashboard'     },
  { label: 'Servers',        icon: IconServer,          path: 'servers'       },
  { label: 'Network',        icon: IconNetwork,         path: 'network'       },
  { label: 'Endpoints',      icon: IconDeviceLaptop,    path: 'endpoints'     },
  { label: 'Software',       icon: IconApps,            path: 'software'      },
  { label: 'Cloud Services', icon: IconCloud,           path: 'cloudservices' },
  { label: 'Databases',      icon: IconDatabase,        path: 'databases'     },
  { label: 'Relationships',  icon: IconArrowsLeftRight, path: 'relationships' },
  { label: 'Change Log',     icon: IconClipboard,       path: 'changelog'     },
  { label: 'Reference',      icon: IconBook,            path: 'reference'     },
]

export default function Sidebar({ activePage, onNavigate, collapsed }: SidebarProps) {
  return (
    <Box
      style={{
        width: collapsed ? 52 : 230,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #E3E8EF',
        transition: 'width 220ms ease',
        overflow: 'hidden',
      }}
    >
      <Box style={{
        height: 58,
        borderBottom: '1px solid #E3E8EF',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        overflow: 'hidden',
      }}>
        <Box style={{
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 180ms ease',
          pointerEvents: collapsed ? 'none' : 'auto',
          whiteSpace: 'nowrap',
        }}>
          <Text fw={700} size="sm" c="black" tt="uppercase">CMDB System</Text>
          <Text size="xs" c="dimmed" mt={-3.3}>IT Asset Registry</Text>
        </Box>
      </Box>

      <Stack gap={2} px={6} py="md" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.path

          const button = (
            <UnstyledButton
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10,
                padding: collapsed ? '7px 0' : '7px 8px',
                borderRadius: 6,
                width: '100%',
                color: isActive ? '#5375BF' : '#585c64',
                backgroundColor: isActive ? '#DEE9FC' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
              }}
            >
              <Box style={{
                width: 16, 
                height: 16, 
                flexShrink: 0,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
              }}>
                <Icon size={17} />
              </Box>
              <Box style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 200,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'opacity 180ms ease, max-width 220ms ease',
                fontSize: 13,
              }}>
                {item.label}
              </Box>
            </UnstyledButton>
          )

          return collapsed ? (
            <Tooltip key={item.path} label={item.label} position="right" withArrow>
              {button}
            </Tooltip>
          ) : button
        })}
      </Stack>
    </Box>
  )
}