import { useEffect, useState } from 'react'

type Client = {
  id: number
  firstName: string
  lastName: string
  phone: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getClients() {
      const url = '/api/clients'

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }

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

  if (clients.length === 0) {
    return <p>No clients yet</p>
  }

  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id}>
          {client.firstName} {client.lastName} {client.phone ?? ''}{' '}
          {client.notes ?? ''}
        </li>
      ))}
    </ul>
  )
}
