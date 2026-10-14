# The SMS delivery callback route is not owner-authenticated

SMSAPI reports delivery status with an unsigned GET request to a public URL, so the route cannot call `requireOwner()`. It is the single exception to that rule. It is protected by a secret token in the path and a check of SMSAPI's published source IPs, and Caddy forwards only that one path. It only updates `status` for a known `provider_message_id` and never trusts the rest of the payload.

## Considered options

- Token only, or source IPs only: each fails alone if the URL leaks or an IP list changes.
- Polling instead of callbacks: no status-check endpoint was found in the docs we read. Revisit when the SMS phase starts.
