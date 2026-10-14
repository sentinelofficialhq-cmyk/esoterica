#!/usr/bin/env bash
# Builds a scratch database from the migrations, seeds groups of installs with known retention and
# conversion, and checks experiment_results and the access rules. Needs psql and a local Postgres 15+;
# connection comes from the usual PG* variables (PGHOST, PGPORT, PGUSER).
#   PGHOST=/var/run/postgresql PGUSER=postgres supabase/tests/results/run.sh
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../../.." && pwd)
db=${RESULTS_TEST_DB:-esoterica_results_test}
psql=(psql -v ON_ERROR_STOP=1 -q)
"${psql[@]}" -d postgres -c "drop database if exists $db" 2>/dev/null
"${psql[@]}" -d postgres -c "create database $db"
err=$(mktemp)
trap 'rm -f "$err"; "${psql[@]}" -d postgres -c "drop database if exists '"$db"'" 2>/dev/null' EXIT
for f in "$here/stub.sql" "$root"/supabase/migrations/*.sql "$here/seed.sql" "$here/checks.sql"; do
  if ! "${psql[@]}" -d "$db" -f "$f" >/dev/null 2>"$err"; then
    echo "FAILED in ${f#"$root"/}"
    cat "$err"
    exit 1
  fi
  grep -o "NOTICE:  ok: .*" "$err" | sed 's/NOTICE:  //' || true
done
echo "all checks passed"
