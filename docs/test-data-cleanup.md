# Score Base Test Data Cleanup

Use clear names for Production smoke-test data:

- `SB_TEST_TEAM_YYYYMMDD`
- `SB_TEST_PLAYER_YYYYMMDD`
- `SB_TEST_GAME_YYYYMMDD`

Do not document test email addresses, passwords, secret keys, or database connection URLs.

## Cleanup Order

1. Confirm the records are test-only data.
2. Export or screenshot any evidence needed for the smoke-test report.
3. Delete test games first if cleanup is required.
4. Delete test players.
5. Revoke pending test invitations.
6. Delete test teams only if all related member/role checks are complete.

Use Supabase Table Editor carefully. Do not delete non-test records.
