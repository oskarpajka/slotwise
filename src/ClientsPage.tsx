import { AddClientForm } from './AddClientForm'
import { ClientList } from './ClientList'
import { useEffect, useState } from 'react'
import type { Client } from './types.ts'

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getClients() {
      const url = '/api/clients'

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Response status: ${response.status}`)

        const result = (await response.json()) as Client[]
        setClients(result)
      } catch (err) {
        console.error(err)
        setError('Could not load clients')
      } finally {
        setLoading(false)
      }
    }

    void getClients()
  }, [])

  if (loading) {
    return <p>Loading clients...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <AddClientForm onCreated={(client) => setClients([...clients, client])} />
      <ClientList clients={clients} />
    </div>
  )
}
