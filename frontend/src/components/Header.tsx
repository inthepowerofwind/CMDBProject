import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Text,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Divider,
} from '@mantine/core'
import { IconMenu2, IconLogout, IconUserEdit, IconAlertTriangle } from '@tabler/icons-react'
import { AuthUser } from '../api/authService'

interface HeaderProps {
  activePage: string
  onToggleSidebar: () => void
  user: AuthUser
  onLogout: () => void
}

const pageTitles: Record<string, string> = {
  dashboard:     'Dashboard',
  servers:       'Servers',
  network:       'Network',
  endpoints:     'Endpoints',
  software:      'Software',
  cloudservices: 'Cloud Services',
  databases:     'Databases',
  relationships: 'CI Relationships Register',
  changelog:     'CI Change Log',
  reference:     'Reference / Lookup Tables',
}

export default function Header({ activePage, onToggleSidebar, user, onLogout }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [profileName, setProfileName] = useState(user.name)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarBtnRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEditProfileSave = () => {
    // TODO: call update API here with profileName
    setEditProfileOpen(false)
  }

  const handleEditProfileClose = () => {
    setProfileName(user.name)
    setEditProfileOpen(false)
  }

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      {/* Header Bar */}
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

        <Box style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          {/* Clickable avatar */}
          <Box
            component="button"
            ref={avatarBtnRef}
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="User menu"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#DEE9FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: dropdownOpen ? '2px solid #5375BF' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              transition: 'border-color 0.15s',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Text size="xs" fw={700} c="#5375BF">
              {initials}
            </Text>
          </Box>

          {/* Name / role */}
          <Box>
            <Text size="sm" fw={600} c="#0F172A" style={{ lineHeight: 1.2 }}>{user.name}</Text>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>Admin</Text>
          </Box>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <Box
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                minWidth: 180,
                backgroundColor: 'white',
                border: '1px solid #E3E8EF',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                zIndex: 200,
                overflow: 'hidden',
                padding: '4px 0',
              }}
            >
              {/* Profile header inside dropdown */}
              <Box style={{ padding: '10px 14px 8px' }}>
                <Text size="xs" fw={500} c="#0F172A">{user.name}</Text>
                <Text size="xs" c="dimmed">Admin</Text>
              </Box>

              <Divider color="#F1F5F9" />

              {/* Edit Profile */}
              <Box
                component="button"
                onClick={() => {
                  setDropdownOpen(false)
                  setEditProfileOpen(true)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#0F172A',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <IconUserEdit size={15} color="#5375BF" />
                Edit Profile
              </Box>

              {/* Logout */}
              <Box
                component="button"
                onClick={() => {
                  setDropdownOpen(false)
                  setLogoutConfirmOpen(true)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#E03131',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <IconLogout size={15} color="#E03131" />
                Logout
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Edit Profile Modal */}
      <Modal
        opened={editProfileOpen}
        onClose={handleEditProfileClose}
        title={
          <Text fw={700} size="md" c="#0F172A">Edit Profile</Text>
        }
        centered
        size="sm"
        radius="md"
        overlayProps={{ blur: 2, backgroundOpacity: 0.35 }}
      >
        <Stack gap="lg">
          {/* Avatar display */}
          <Stack align="center" gap="xs">
            <Box
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#DEE9FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid #C5D5F8',
              }}
            >
              <Text size="xl" fw={700} c="#5375BF">
                {profileName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </Text>
            </Box>
          </Stack>

          {/* Name field */}
          <TextInput
            label="Display Name"
            placeholder="Enter your name"
            value={profileName}
            onChange={(e) => setProfileName(e.currentTarget.value)}
            styles={{
              label: { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 4 },
            }}
          />

          {/* Actions */}
          <Group justify="flex-end" gap="sm" mt={4}>
            <Button variant="default" size="sm" onClick={handleEditProfileClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              color="blue"
              onClick={handleEditProfileSave}
              disabled={!profileName.trim()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        withCloseButton={false}
        centered
        size="sm"
        radius="md"
        overlayProps={{ blur: 2, backgroundOpacity: 0.35 }}
        padding="xl"
      >
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#FFF1F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconAlertTriangle size={26} color="#E03131" />
          </Box>

          <Stack align="center" gap={4}>
            <Text fw={700} size="md" c="#0F172A">Sign Out</Text>
            <Text size="sm" c="dimmed" ta="center">
              Are you sure you want to sign out?
            </Text>
          </Stack>

          <Group justify="center" gap="sm" w="100%" mt={4}>
            <Button
              variant="default"
              size="sm"
              style={{ flex: 1 }}
              onClick={() => setLogoutConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              size="sm"
              style={{ flex: 1 }}
              onClick={() => {
                setLogoutConfirmOpen(false)
                onLogout()
              }}
            >
              Yes, Sign Out
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}