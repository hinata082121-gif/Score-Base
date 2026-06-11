# Score Base Roles and Permissions

## Role Strength

`OWNER > ADMIN > EDITOR > SCORER > VIEWER`

## Permissions

| Operation | OWNER | ADMIN | EDITOR | SCORER | VIEWER |
| --- | --- | --- | --- | --- | --- |
| Team view | Yes | Yes | Yes | Yes | Yes |
| Team edit | Yes | Yes | Yes | No | No |
| Team delete | Yes | No | No | No | No |
| Member invite | Yes | Yes | No | No | No |
| Member role change | Yes | Yes | No | No | No |
| Player create/edit | Yes | Yes | Yes | No | No |
| Game view | Yes | Yes | Yes | Yes | Yes |
| Scorebook input | Yes | Yes | Yes | Yes | No |
| Game delete | Yes | Yes | No | No | No |
| Team management | Yes | Yes | No | No | No |

Server Actions must enforce these rules. UI button visibility is only a convenience and is not trusted.

## Production Smoke Scenario

1. User A creates a team and becomes OWNER.
2. User A creates a VIEWER invitation.
3. User B accepts the invitation.
4. User B can view the team.
5. User B cannot edit the team or players.
6. User A changes User B to SCORER.
7. User B can input scorebook records but cannot manage members.
8. User A changes User B to EDITOR.
9. User B can create and edit players.
10. User A changes User B to ADMIN.
11. User B can create invitations.
12. The last OWNER cannot be removed or downgraded.

## v0.7.2 Enforcement Notes

- OWNER invitations are rejected in Server Actions and repository logic.
- Team-scoped DB games persist `teamId` when created from a team workspace.
- SCORER and higher roles can create/update team scorebook records.
- Game deletion is separate from scorebook input: owners and ADMIN+ can delete team games; SCORER cannot delete team games.
- UI visibility is still secondary. Treat Server Action authorization as the source of truth.
