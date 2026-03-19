import { useState } from 'react'
import { Box, Card, TextInput, PasswordInput, Button, Text, Alert } from '@mantine/core'
import { IconLock, IconMail, IconAlertCircle } from '@tabler/icons-react'
import { authService, AuthUser } from '../api/authService'

interface LoginProps {
  onLogin: (user: AuthUser) => void   
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError]       = useState<string>('')
  const [loading, setLoading]   = useState<boolean>(false)

  async function handleSubmit() {
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      const { user } = await authService.login({ email, password })
      onLogin(user)                        // passes real AuthUser object
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.email?.[0] ??
        err?.response?.data?.errors?.password?.[0] ??
        'Login failed. Please try again.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box style={{
      minHeight: '100vh', backgroundColor: '#111F3D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Card shadow="xl" radius="lg" p="xl" style={{ width: 420, backgroundColor: '#F8FAFC' }}>
        <Box ta="center" mb="xl">
          <Text fw={700} size="xl" c="#111F3D">Configuration Management Database</Text>
          <Text size="xs" c="dimmed" mt={4}>IT Asset Registry — ISO 27001 | ITIL 4</Text>
        </Box>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md" radius="md">
            {error}
          </Alert>
        )}

        <TextInput
          label="Email" placeholder="Enter email"
          leftSection={<IconMail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          mb="md"
        />
        <PasswordInput
          label="Password" placeholder="Enter password"
          leftSection={<IconLock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          mb="xl"
        />
        <Button fullWidth size="md" radius="md" loading={loading}
          onClick={handleSubmit} style={{ backgroundColor: '#111F3D' }}>
          Sign In
        </Button>
      </Card>
    </Box>
  )
}