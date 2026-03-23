import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import { authService, AuthUser } from './api/authService'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/dashboard'
import Servers from './pages/Servers'
import ChangeLog from './pages/ChangeLog'


type PageName =
  | 'dashboard' | 'servers'   | 'network'
  | 'endpoints' | 'software'  | 'cloudservices'
  | 'databases' | 'relationships' | 'changelog' | 'reference'

function getPage(activePage: PageName) {
  switch (activePage) {
    case 'dashboard': return <Dashboard />
    case 'servers':   return <Servers />
    // case 'network':   return <Network/>
    case 'endpoints':
    case 'software':
    case 'cloudservices':
    case 'databases':
    case 'relationships':
    case 'changelog':
    case 'reference':
    case 'changelog': return <ChangeLog />
    default:
      return (
        <Box p="xl">
          <Text c="dimmed"><strong>{activePage}</strong></Text>
        </Box>
      )
  }
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(
    () => authService.getStoredUser()   // restores session on refresh
  )
  const [activePage, setActivePage] = useState<PageName>('dashboard')

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

  const handleLogout = async () => {
    try { await authService.logout() } catch { }
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p as PageName)}
        collapsed={sidebarCollapsed}
      />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          activePage={activePage}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          user={user}
          onLogout={handleLogout}
        />
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          {getPage(activePage)}
        </Box>
      </Box>
    </Box>
  )
}