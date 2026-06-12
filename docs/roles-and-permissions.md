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

## v0.7.3 Manual Verification

- VIEWER: can open team and related records, cannot mutate team/player/game/member data.
- SCORER: can update scorebook records for team games, cannot delete team games.
- EDITOR: can edit team/player data, cannot manage invitations or members.
- ADMIN: can manage invitations and members, can delete team games, cannot remove or downgrade the last OWNER.
- OWNER: full team control; OWNER invitations are intentionally rejected.
- Check Server Action failures from the UI and Supabase row changes together. UI button visibility alone is not sufficient.

## v0.7.5 Scorebook Setup Notes

- SCOREBOOK games use details confirmation, lineup confirmation, game start, then live input.
- SCORER can enter live scorebook records for team games.
- VIEWER can view but cannot enter or save scorebook records.
- After game start, the UI does not offer normal lineup editing.
- If a Game already has PlateAppearance rows, repository logic rejects destructive LineupEntry changes even for OWNER / ADMIN / EDITOR / SCORER.
- Pinch hitter, defensive substitution, and pitching change workflows are planned as a separate player-substitution phase.

## v0.7.6 Player Management Notes

- OWNER / ADMIN / EDITOR can create, edit, and delete players attached to their team.
- SCORER can view team players and use them for scorebook input, but cannot edit player master data.
- VIEWER can view team players but cannot edit player master data.
- Player create/update/delete Server Actions enforce these rules through TeamMember role checks.
- Team-created players keep both `teamId` and `ownerId`; `/players` lists both owner-created players and active TeamMember team players.

## v0.7.7 Player Detail Notes

- DB-backed `/players/[id]` uses server-side authorization before rendering player detail data.
- PRIVATE players are visible to the owner, active TeamMembers of the attached team, or no one else.
- PUBLIC players may be viewed without team membership after authentication resolves the request path.
- OWNER / ADMIN / EDITOR can use detail and edit links from `/teams/[id]`; SCORER / VIEWER get detail access and read-only labels.
- `returnTo` is accepted only as an internal path and is used to return from player detail or edit pages to the team detail page.

## v0.7.8 Production Role Status

- OWNER-equivalent behavior was verified in Production by creating a DB team and DB player, opening player detail, and saving from the edit route back to the team detail page.
- Registered DB players were confirmed as scorebook lineup candidates when their team is selected.
- SCORER and VIEWER were not re-tested in this pass because a second authenticated test user session is required.
- Next manual role test: User B accepts a VIEWER invitation, then User A changes User B through SCORER, EDITOR, and ADMIN while checking scorebook input, player/team editing, invitation management, and Game deletion boundaries.
- Server Action authorization remains the source of truth; UI visibility alone is not sufficient.
