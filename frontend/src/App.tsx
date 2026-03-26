import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import { authService, AuthUser } from './api/authService'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/dashboard'
import Servers from './pages/Servers'
import ChangeLog from './pages/ChangeLog'
import Network  from './pages/Network'
import Endpoints from './pages/Endpoints'
import Software from './pages/Software'
import CloudServices from './pages/CloudServices'
import Databases from './pages/Databases'
import Relationships from './pages/Relationships'
import References from './pages/Reference'

type PageName =
  | 'dashboard' | 'servers'   | 'network'
  | 'endpoints' | 'software'  | 'cloudservices'
  | 'databases' | 'relationships' | 'changelog' | 'reference'

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(
    () => authService.getStoredUser()
  )
  const [activePage, setActivePage] = useState<PageName>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

  const handleLogout = async () => {
    try { await authService.logout() } catch { }
    setUser(null)
  }

  function getPage(page: PageName) {
    switch (page) {
      case 'dashboard':     return <Dashboard onNavigate={(p) => setActivePage(p as PageName)} />
      case 'servers':       return <Servers />
      case 'network':       return <Network />
      case 'endpoints':     return <Endpoints />
      case 'software':      return <Software />
      case 'cloudservices': return <CloudServices />
      case 'databases':     return <Databases />
      case 'relationships': return <Relationships />
      case 'changelog':     return <ChangeLog />
      case 'reference':     return <References />
      default:
        return (
          <Box p="xl">
            <Text c="dimmed"><strong>{page}</strong></Text>
          </Box>
        )
    }
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