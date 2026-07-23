# Phase 1 database

This phase uses SQLite. The database can be recreated and seeded with:

```sh
sqlite3 khidmat.db < schema.sql
sqlite3 khidmat.db < seed_data.sql
```

Run `validation_queries.sql` for read-only validation queries. Run
`constraint_tests.sql` only against a disposable database: every statement in
that file is expected to fail and confirms that a constraint rejects invalid
data.

SQLite enables foreign-key enforcement per connection, not globally. The
application must execute the following when it opens each database connection:

```sql
PRAGMA foreign_keys = ON;
```
