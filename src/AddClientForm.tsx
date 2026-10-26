import { useState } from 'react'
import type { Client } from './types.ts'

type AddClientFormProps = { onCreated: (client: Client) => void }

export function AddClientForm({ onCreated }: AddClientFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          notes: notes,
        }),
      })
      if (!response.ok) throw new Error('Failed to add a new client')

      const result = (await response.json()) as Client
      onCreated(result)

      setFirstName('')
      setLastName('')
      setPhone('')
      setNotes('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label>
          First name
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          Last name
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <label>
          Phone number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="submit">Save</button>
      </form>
    </>
  )
}
