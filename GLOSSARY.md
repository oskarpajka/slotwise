# Glossary

Shared domain language for Slotwise. Use these words in code, files and UI copy. If a term is missing, add it here first.

## People

- **Owner**: the one person who logs in and runs the business.
- **Client**: a customer of the business. Never a user of the app. Not "customer" or "patient".

## Booking

- **Service**: something the business sells, with a price and a duration. Can be active or archived.
- **Appointment**: one client booked for one service at a time slot. Has a status: `scheduled`, `completed`, `cancelled` or `no_show`.
- **Snapshot**: the price and duration copied from the service onto an appointment at booking time. Later changes to the service do not touch it.
- **Slot**: a free time range on the calendar where an appointment can be placed.
- **Overlap**: two appointments that share time. The database rejects it for `scheduled` and `completed` appointments.
- **No-show**: the client did not come. A status, and a count on the client page.

## Availability

- **Working hours**: the opening and closing time for each open weekday.
- **Block**: a time range where nothing can be booked, such as a break, a holiday or a day off.
- **Outside hours**: a booking that falls outside working hours or inside a block. The app warns but does not forbid it.

## SMS

- **Outbox**: the stored record of every SMS, sent or not.
- **Message**: one SMS in the outbox. Types: `confirmation`, `reminder`, `changed`, `cancelled`.
- **Template**: the editable default text for one message type, with placeholders.
- **Placeholder**: a token such as `{imie}` that is replaced with real data when the message is built.
- **Segment**: one billable SMS part. Polish diacritics switch a message to Unicode, which shortens a segment.
- **Provider**: the service that delivers messages. `smsapi` sends real SMS. `outbox` stores them and sends nothing.
- **Opt-out**: a client flag meaning no SMS may be sent to them.

## Privacy (RODO)

- **Health info**: a separate, encrypted field on a client, with a consent date. Never mixed into general notes.
- **Archive**: the normal way to remove a client from daily use. Data is kept.
- **Erase**: the hard delete of a client and their SMS history, for a RODO request.
- **Inactive client**: a client with no visit within the retention period.
- **Export**: a client's data as JSON and PDF, for a RODO request.
