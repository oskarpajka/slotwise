# Glossary

Shared domain language for Slotwise. Use these words in code, files and UI copy. If a term is missing, add it here first.

## People

- **Owner**: the one person who logs in and runs the business. Not "user" or "admin".
- **Operator**: the person who runs the server and its command-line tools, such as creating the owner or resetting their second factor. Never logs in to the app.
- **Client**: a customer of the business. Never a user of the app. Not "customer" or "patient".

## Access

- **Second factor**: a 6-digit code from an authenticator app on the owner's phone, asked after the password.
- **Backup code**: a one-time code shown once when the second factor is set up, for when the phone is not at hand.
- **Trusted device**: a device where the second factor was confirmed recently, so for a while only the password is asked.
- **Audit log**: the record of security and privacy events, such as logins and erasures. Never holds personal data.

## Booking

- **Service**: something the business sells, with a price and a duration. Can be active or archived.
- **Appointment**: one client booked for one service at a time slot. Has a status: `scheduled`, `completed`, `cancelled` or `no_show`.
- **Snapshot**: the price and duration copied from the service onto an appointment at booking time. Later changes to the service do not touch it.
- **Slot**: a free time range on the calendar where an appointment can be placed.
- **Overlap**: two appointments that share time. The database rejects it for `scheduled` and `completed` appointments.
- **No-show**: the client did not come. A status, and a count on the client page.

## Availability

- **Working hours**: the shifts for each open weekday.
- **Shift**: one opening and closing time on a weekday. A weekday can have several, so a lunch break is the gap between two shifts.
- **Block**: a one-off time range where nothing can be booked, such as a holiday or a day off. Recurring breaks are gaps between shifts, not blocks. Adding a block over existing appointments lists them first and changes none of them.
- **Outside hours**: a booking that falls outside working hours or inside a block. The app warns but does not forbid it.

## SMS

- **Outbox**: the stored record of every SMS, sent or not.
- **Message**: one SMS in the outbox. Types: `confirmation`, `reminder`, `changed`, `cancelled`.
- **Template**: the editable default text for one message type, with placeholders.
- **Placeholder**: a token such as `{imie}` that is replaced with real data when the message is built.
- **Segment**: one billable SMS part. Polish diacritics switch a message to Unicode, which shortens a segment.
- **Provider**: the service that delivers messages. `smsapi` sends real SMS. `dry-run` only stores them in the outbox and sends nothing. Not to be confused with the Outbox itself, which holds messages from every provider.
- **Opt-out**: a client flag meaning no SMS may be sent to them.

## Privacy (RODO)

- **Health info**: a separate, encrypted field on a client, with a consent date. Never mixed into general notes.
- **Archive**: the normal way to remove a client from daily use. Data is kept.
- **Erase**: the hard delete of a client, their appointments and their SMS history, for a RODO request. The audit log stays because it holds no personal data.
- **Inactive client**: a client with no `completed` appointment within the retention period and no future `scheduled` appointment. `no_show` and `cancelled` do not count as a visit. A client who never had a visit is measured from their creation date.
- **Export**: a client's data as JSON and PDF, for a RODO request.
