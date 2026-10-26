import { useState, useEffect } from 'react'
import './App.css'
import { ClientList } from './ClientList.tsx'
import { AddClientForm } from './AddClientForm.tsx'

function App() {
  const [message, setMessage] = useState('checking...')

  useEffect(() => {
    async function checkHealth() {
      const url = '/api/health'

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }

        const result = (await response.json()) as { ok: boolean }
        if (result.ok === true) {
          setMessage('API: ok')
        } else {
          setMessage('API: unexpected answer')
        }
      } catch (error) {
        console.error(error)
        setMessage('API: down')
      }
    }
    void checkHealth()
  }, [])

  return (
    <>
      <p>{message}</p>
      <ClientList />
      <AddClientForm />
    </>
  )
}

export default App
