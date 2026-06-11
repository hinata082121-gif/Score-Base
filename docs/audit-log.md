# Score Base AuditLog

v0.7.3 starts minimal AuditLog recording without schema changes.

## Recorded Actions

- Team: create, update, delete
- TeamMember: role update, remove
- Invitation: create, accept, revoke
- Game: create, update, delete
- ExportSnapshot: create

## Policy

- AuditLog write failures do not block the main user action.
- AuditLog detail must not include secrets, passwords, connection URLs, or full personal credentials.
- AuditLog list UI is not implemented yet. Confirm rows in Supabase Table Editor.

## Next Phase

- Add an admin-only AuditLog viewer.
- Add filters for team, resource type, action, and date.
- Add E2E tests that confirm audit rows are written for core mutations.
