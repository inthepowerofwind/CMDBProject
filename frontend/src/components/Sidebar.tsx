import { Stack, Box, Text, Tooltip, UnstyledButton } from '@mantine/core'
import {
  IconDashboard, IconServer, IconNetwork,
  IconDeviceLaptop, IconApps, IconCloud,
  IconDatabase, IconArrowsLeftRight,
  IconClipboard, IconBook,
} from '@tabler/icons-react'
import { ComponentType, useState } from 'react'
import CMDBLogo from '../assets/CMDB_LogoIcon.png'

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

// Navigation sidebar items
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

interface NavButtonProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onNavigate: (path: string) => void
}

// Sidebar display style
function NavButton({ item, isActive, collapsed, onNavigate }: NavButtonProps) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <UnstyledButton
      key={item.path}
      onClick={() => onNavigate(item.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? 0 : '7px 8px',
        borderRadius: 6,
        width: collapsed ? 40 : '100%',
        height: collapsed ? 34 : 'auto',
        marginLeft: collapsed ? 'auto' : 0,
        marginRight: collapsed ? 'auto' : 0,
        color: isActive ? '#5375BF' : hovered ? '#5375BF' : '#585c64',
        backgroundColor: isActive ? '#DEE9FC' : hovered ? '#F0F4FF' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, width 220ms ease, color 150ms ease',
      }}
    >
      {/* Icon when expand */}
      <Box style={{
        width: 17,
        height: 17,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={17} />
      </Box>

      {/* label fades out when collapsed */}
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
}

// Sidebar layout both when collapsed and expanded
export default function Sidebar({ activePage, onNavigate, collapsed }: SidebarProps) {
  return (
    <Box
      style={{
        width: collapsed ? 52 : 230,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #E3E8EF',
        transition: 'width 220ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo area - shows icon only when collapsed, full logo + title when expanded */}
      <Box
        style={{
          height: 58,
          borderBottom: '1px solid #E3E8EF',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          paddingLeft: collapsed ? 0 : 12,
          overflow: 'hidden',
          transition: 'padding 220ms ease',
          gap: 8,
        }}
      >
        <Tooltip label="CMDB System" position="right" withArrow disabled={!collapsed}>
          <img
            src={CMDBLogo}
            alt="CMDB Logo"
            style={{
              width: collapsed ? 30 : 34,
              height: collapsed ? 30 : 34,
              marginLeft: collapsed ? 10 : 7,
              objectFit: 'contain',
              flexShrink: 0,
              transition: 'width 220ms ease, height 220ms ease',
            }}
          />
        </Tooltip>

        {/* fades out and collapses when sidebar is collapsed */}
        <Box
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 200,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 180ms ease, max-width 220ms ease',
            pointerEvents: collapsed ? 'none' : 'auto',
          }}
        >
          <Text fw={700} size="sm" c="black" tt="uppercase" style={{ lineHeight: 1.2 }}>
            CMDB System
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
            IT Asset Registry
          </Text>
        </Box>
      </Box>

      <Stack gap={2} px={collapsed ? 6 : 6} py="md" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.path

          // Sidebar nav buttons or pages layout
          const button = (
          <NavButton
            key={item.path}
            item={item}
            isActive={isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          )

          // wrap with tooltip showing the label when sidebar is collapsed
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