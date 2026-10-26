import type { Client } from './types.ts'

type ClientListProps = { clients: Client[] }

export function ClientList({ clients }: ClientListProps) {
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
